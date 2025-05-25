package services

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/internal"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type OrchestratorService struct {
	logger          logrus.FieldLogger
	rabbitMQClient  rabbitmq.RabbitMQClient
	redisClient     redis.RedisClient
	workflowRepo    models.WorkflowRepository
	workflowRunRepo models.WorkflowRunRepository
	workflowSvc     models.WorkflowService
}

func NewOrchestratorService(cfg models.AppConfig) models.OrchestratorService {
	return &OrchestratorService{
		workflowRepo:    cfg.GetWorkflowRepository(),
		workflowRunRepo: cfg.GetWorkflowRunRepository(),
		workflowSvc:     cfg.GetWorkflowService(),
		rabbitMQClient:  cfg.GetRabbitMQClient(),
		redisClient:     cfg.GetRedisClient(),
		logger:          cfg.GetLogger(),
	}
}

func (s *OrchestratorService) OrchestrateWorkflow(
	ctx context.Context,
	workflowID int32,
) (int32, error) {
	wg, err := s.workflowRepo.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return -1, fmt.Errorf("orchestrate workflow failed to get workflow graph: %w", err)
	}

	rootNodes := internal.GetRootNodes(wg)

	n := make([]models.ValidateNode, len(wg.Nodes))
	e := make([]models.ValidateEdge, len(wg.Edges))
	nIDs := []int32{}

	for i, edge := range wg.Edges {
		e[i] = models.ValidateEdge{
			SourceNodeID: fmt.Sprintf("%d", edge.SourceNodeID),
			TargetNodeID: fmt.Sprintf("%d", edge.TargetNodeID),
		}
	}

	for i, node := range wg.Nodes {
		n[i] = models.ValidateNode{
			ID:         fmt.Sprintf("%d", node.ID),
			ActionType: node.ActionType,
		}
		isRoot := false

		for _, root := range rootNodes {
			if root.ID == node.ID {
				isRoot = true
				break
			}
		}

		if !isRoot {
			nIDs = append(nIDs, node.ID)
		}
	}

	err = s.workflowSvc.ValidateWorkflowGraph(n, e)
	if err != nil {
		return -1, fmt.Errorf("orchestrate workflow failed to validate workflow graph: %w", err)
	}

	run, err := s.workflowRunRepo.CreateWorkflowRun(ctx, workflowID, n)
	if err != nil {
		return -1, fmt.Errorf("orchestrate workflow failed to create workflow run: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": workflowID,
		"n_ids":       nIDs,
		"run_id":      run.ID,
	}).Info("created workflow run")

	err = s.redisClient.InitializeRunningNodeSet(ctx, run.ID, nIDs)
	if err != nil {
		// it's okay if this fails, we'll just rely on the executor to retry
		s.logger.WithError(err).Warn("failed to initialize running node set")
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": wg.ID,
		"run_id":      run.ID,
		"root_nodes":  rootNodes,
	}).Info("executing workflow")

	for _, parent := range rootNodes {
		err = internal.EnqueueChildNodes(
			ctx,
			s.logger,
			s.workflowRunRepo,
			s.rabbitMQClient,
			workflowID,
			parent.ID,
			run.ID,
		)
		if err != nil {
			return -1, fmt.Errorf("orchestrate workflow failed to enqueue child nodes: %w", err)
		}

		if err := s.redisClient.PublishNodeStatusUpdate(ctx, run.ID, parent.ID, "success", nil); err != nil {
			s.logger.WithError(err).Warn("failed to publish root node status update to redis")
		}
	}

	return run.ID, nil
}

var _ models.OrchestratorService = (*OrchestratorService)(nil)
