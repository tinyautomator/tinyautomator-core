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

func (s *ExecutorService) checkIfNodeTaskIsAlreadyCompleted(
	ctx context.Context,
	task models.WorkflowNodeTask,
) (bool, error) {
	workflowNodeRun, err := s.workflowRunRepo.GetWorkflowNodeRun(ctx, task.NodeRunID)
	if err != nil {
		s.logger.WithError(err).Warn("failed to get workflow node run status from db")
		return false, fmt.Errorf("failed to get workflow node run status from db: %w", err)
	}

	return workflowNodeRun.Status == "completed", nil
}

func (s *ExecutorService) reinitializeRunningNodeSet(
	ctx context.Context,
	runID int32,
	nIDs []int32,
) error {
	// 5 second TTL
	lockAcquired, err := s.redisClient.TryAcquireWorkflowRunFinalizationLock(ctx, runID)
	if err != nil {
		return fmt.Errorf("failed to acquire workflow finalization lock: %w", err)
	}

	if !lockAcquired {
		return errors.New("workflow finalization already in progress by another worker")
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
	task models.WorkflowNodeTask,
) (bool, error) {
	remaining, err := s.redisClient.MarkNodeCompleteAndCountRemaining(ctx, task.RunID, task.NodeID)
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

		remaining = len(workflowNodeRuns)
	}

	return remaining == 0, nil
}

func (s *ExecutorService) runWorkflowNodeTask(
	ctx context.Context,
	task models.WorkflowNodeTask,
) error {
	s.logger.WithFields(logrus.Fields{
		"workflow_id": task.WorkflowID,
		"run_id":      task.RunID,
		"node_id":     task.NodeID,
		"node_run_id": task.NodeRunID,
	}).Info("executing workflow node")

	if err := s.workflowRunRepo.WithTransaction(ctx, func(txCtx context.Context, txRepo models.WorkflowRunRepository) error {
		if err := txRepo.CompleteWorkflowNodeRun(txCtx, task.NodeRunID); err != nil {
			return fmt.Errorf("failed to mark node run as completed: %w", err)
		}

		// TODO: execute real task logic
		// if err := executeWorkflowNode(task); err != nil {
		// 	return fmt.Errorf("task execution failed: %w", err)
		// }
		time.Sleep(5 * time.Second)

		// TODO: if the api call fails we mark the node run as failed

		return nil
	}); err != nil {
		s.logger.WithError(err).Warn("workflow node execution failed and transaction rolled back")
		return fmt.Errorf("workflow node execution failed and transaction rolled back: %w", err)
	}

	s.logger.WithField("node_id", task.NodeID).Info("workflow node executed successfully")

	return nil
}

func (s *ExecutorService) ExecuteWorkflowNode(ctx context.Context, msg []byte) error {
	var task models.WorkflowNodeTask
	if err := json.Unmarshal(msg, &task); err != nil {
		return fmt.Errorf("failed to unmarshal task: %w", err)
	}

	// first we check if we've already completed the node task but failed on the publish child nodes step
	shouldSkipExecution, err := s.checkIfNodeTaskIsAlreadyCompleted(ctx, task)
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
		}).Info("node task already completed")
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
		err = s.workflowRunRepo.CompleteWorkflowRun(ctx, task.RunID)
		if err != nil {
			return fmt.Errorf("failed to complete workflow run: %w", err)
		}

		s.logger.WithFields(logrus.Fields{
			"run_id":      task.RunID,
			"workflow_id": task.WorkflowID,
		}).Info("workflow run completed")
	}

	return nil
}

var _ models.ExecutorService = (*ExecutorService)(nil)
