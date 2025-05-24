package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/internal"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type ExecutorService struct {
	logger          logrus.FieldLogger
	rabbitMQClient  rabbitmq.RabbitMQClient
	redisClient     redis.RedisClient
	workflowRepo    models.WorkflowRepository
	workflowRunRepo models.WorkflowRunRepository
}

func NewExecutorService(cfg models.AppConfig) models.ExecutorService {
	return &ExecutorService{
		logger:          cfg.GetLogger(),
		rabbitMQClient:  cfg.GetRabbitMQClient(),
		redisClient:     cfg.GetRedisClient(),
		workflowRepo:    cfg.GetWorkflowRepository(),
		workflowRunRepo: cfg.GetWorkflowRunRepository(),
	}
}

func (s *ExecutorService) shouldSkipNodeTaskExecution(
	ctx context.Context,
	task *models.WorkflowNodeTask,
) (bool, error) {
	var shouldSkipExecution bool

	workflowNodeRun, err := s.workflowRunRepo.GetWorkflowNodeRun(ctx, task.RunID, task.NodeID)
	if err != nil {
		s.logger.WithError(err).Warn("failed to get workflow node run status from db")
		return false, fmt.Errorf("failed to get workflow node run status from db: %w", err)
	}

	shouldSkipExecution = workflowNodeRun.Status == "success"
	task.RetryCount = workflowNodeRun.RetryCount

	if task.RetryCount == 3 {
		shouldSkipExecution = true
		return shouldSkipExecution, nil
	}

	return shouldSkipExecution, nil
}

func (s *ExecutorService) reinitializeRunningNodeSet(
	ctx context.Context,
	runID int32,
	nIDs []int32,
) error {
	// 5 second TTL
	lockAcquired, err := s.redisClient.TryAcquireWorkflowRunFinalizationLock(ctx, runID)
	if err != nil {
		return fmt.Errorf("failed to acquire workflow reinitialization lock: %w", err)
	}

	if !lockAcquired {
		return errors.New(
			"workflow run reinitialization in redis already in progress by another worker",
		)
	}

	// refresh cache
	err = s.redisClient.InitializeRunningNodeSet(ctx, runID, nIDs)
	if err != nil {
		s.logger.WithError(err).Warn("failed to initialize running node set")
	}

	return nil
}

func (s *ExecutorService) shouldFinalizeWorkflowRun(
	ctx context.Context,
	task *models.WorkflowNodeTask,
) (bool, error) {
	remaining, err := s.redisClient.MarkNodeCompleteAndCountRemaining(
		ctx,
		task.RunID,
		task.NodeID,
		task.Status,
	)
	if err != nil {
		// cache load failed, need to get the remaining nodes from the database
		pending := "pending"

		workflowNodeRuns, err := s.workflowRunRepo.GetWorkflowNodeRuns(ctx, task.RunID, &pending)
		if err != nil {
			return false, fmt.Errorf(
				"failed to get workflow node runs and count remaining: %w",
				err,
			)
		}

		if len(workflowNodeRuns) == 0 {
			return true, nil
		}

		nIDs := make([]int32, len(workflowNodeRuns))
		for idx, nodeRun := range workflowNodeRuns {
			nIDs[idx] = nodeRun.WorkflowNodeID
		}

		err = s.reinitializeRunningNodeSet(ctx, task.RunID, nIDs)
		if err != nil {
			s.logger.WithError(err).Warn("failed to reinitialize running node set")
		}

		r := len(workflowNodeRuns)
		remaining = &r
	}

	return *remaining == 0, nil
}

func (s *ExecutorService) runWorkflowNodeTask(
	ctx context.Context,
	task *models.WorkflowNodeTask,
) error {
	kv := logrus.Fields{
		"workflow_id": task.WorkflowID,
		"run_id":      task.RunID,
		"node_id":     task.NodeID,
		"node_run_id": task.NodeRunID,
	}

	s.logger.WithFields(kv).Info("executing workflow node")

	now := time.Now().UnixMilli()

	if err := s.workflowRunRepo.MarkWorkflowNodeAsRunning(ctx, task.NodeRunID, now, task.RetryCount+1); err != nil {
		return fmt.Errorf("failed to mark node run as running: %w", err)
	}

	err := s.redisClient.PublishNodeStatusUpdate(ctx, task.RunID, task.NodeID, "running", nil)
	if err != nil {
		s.logger.WithError(err).WithFields(kv).Warn("failed to publish node status update")
	}

	doTask := func() error {
		time.Sleep(30 * time.Second)

		if task.NodeID == 111 {
			return errors.New("test error")
		}

		return nil
	}

	var taskErr error

	if err := doTask(); err != nil {
		s.logger.WithFields(kv).WithError(err).Warn("workflow node execution failed")

		errMsg := err.Error()
		if err := s.workflowRunRepo.UpdateWorkflowNodeRunStatus(ctx, task.NodeRunID, "failed", &errMsg); err != nil {
			return fmt.Errorf("failed to mark node run as failed: %w", err)
		}

		task.Status = "failed"
		taskErr = fmt.Errorf("task execution failed: %w", err)
	} else {
		if err := s.workflowRunRepo.UpdateWorkflowNodeRunStatus(ctx, task.NodeRunID, "success", nil); err != nil {
			return fmt.Errorf("failed to mark node run as success: %w", err)
		}

		task.Status = "success"

		s.logger.WithFields(kv).Info("workflow node executed successfully")
	}

	statusDetails := map[string]interface{}{
		"message": "Node processing finished.",
	}
	if errPub := s.redisClient.PublishNodeStatusUpdate(ctx, task.RunID, task.NodeID, task.Status, statusDetails); errPub != nil {
		s.logger.WithError(errPub).WithFields(logrus.Fields{
			"run_id":  task.RunID,
			"node_id": task.NodeID,
			"status":  task.Status,
		}).Warn("failed to publish status update after marking node complete; primary operation succeeded")
	}

	return taskErr
}

func (s *ExecutorService) ExecuteWorkflowNode(ctx context.Context, msg []byte) error {
	var task *models.WorkflowNodeTask
	if err := json.Unmarshal(msg, &task); err != nil {
		return fmt.Errorf("failed to unmarshal task: %w", err)
	}

	// first we check if we've:
	// 1. already completed the node task
	// 2. failed on the publish child nodes step
	// 3. OR exceeded the max retry count
	shouldSkipExecution, err := s.shouldSkipNodeTaskExecution(ctx, task)
	if err != nil {
		// not ideal - we might end up processing the task > 1 time
		return fmt.Errorf("failed to check if node task is already completed: %w", err)
	}

	if !shouldSkipExecution {
		err := s.runWorkflowNodeTask(ctx, task)
		if err != nil {
			return fmt.Errorf("failed to run workflow node task: %w", err)
		}
	} else {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": task.WorkflowID,
			"run_id":      task.RunID,
			"node_id":     task.NodeID,
			"retry_count": task.RetryCount,
			"max_retries": 3,
		}).Info("node task marked as should skip execution")
	}

	err = internal.EnqueueChildNodes(
		ctx,
		s.logger,
		s.workflowRepo,
		s.workflowRunRepo,
		s.rabbitMQClient,
		task.WorkflowID,
		task.NodeID,
		task.RunID,
	)
	if err != nil {
		return fmt.Errorf("failed to enqueue child nodes: %w", err)
	}

	shouldFinalize, err := s.shouldFinalizeWorkflowRun(ctx, task)
	if err != nil {
		return fmt.Errorf("failed to check if workflow run should be finalized: %w", err)
	}

	if shouldFinalize {
		workflowNodeRuns, err := s.workflowRunRepo.GetWorkflowNodeRuns(ctx, task.RunID, nil)
		if err != nil {
			return fmt.Errorf("failed to get workflow node runs: %w", err)
		}

		status := "completed"

		for _, nodeRun := range workflowNodeRuns {
			if nodeRun.Status == "failed" {
				status = "failed"
				break
			}
		}

		err = s.workflowRunRepo.CompleteWorkflowRun(ctx, task.RunID, status)
		if err != nil {
			return fmt.Errorf("failed to complete workflow run: %w", err)
		}

		s.logger.WithFields(logrus.Fields{
			"run_id":      task.RunID,
			"workflow_id": task.WorkflowID,
			"status":      status,
		}).Info("workflow run completed")
	}

	return nil
}

var _ models.ExecutorService = (*ExecutorService)(nil)
