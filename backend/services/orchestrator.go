package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type OrchestratorService struct {
	logger          logrus.FieldLogger
	rabbitMQClient  rabbitmq.RabbitMQClient
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
		logger:          cfg.GetLogger(),
	}
}

func (s *OrchestratorService) OrchestrateWorkflow(ctx context.Context, workflowID int32) error {
	wg, err := s.workflowRepo.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to get workflow graph: %w", err)
	}

	n := make([]models.ValidateNode, len(wg.Nodes))
	e := make([]models.ValidateEdge, len(wg.Edges))

	for i, node := range wg.Nodes {
		n[i] = models.ValidateNode{
			ID:         fmt.Sprintf("%d", node.ID),
			ActionType: node.ActionType,
		}
	}

	for i, edge := range wg.Edges {
		e[i] = models.ValidateEdge{
			SourceNodeID: fmt.Sprintf("%d", edge.SourceNodeID),
			TargetNodeID: fmt.Sprintf("%d", edge.TargetNodeID),
		}
	}

	err = s.workflowSvc.ValidateWorkflowGraph(n, e)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to validate workflow graph: %w", err)
	}

	run, err := s.workflowRunRepo.CreateWorkflowRun(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to create workflow run: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": workflowID,
		"run_id":      run.ID,
	}).Info("created workflow run")

	s.logger.WithFields(logrus.Fields{
		"workflow_id": wg.ID,
		"run_id":      run.ID,
	}).Info("→ executing workflow")

	hasIncoming := make(map[int32]bool)
	for _, edge := range wg.Edges {
		hasIncoming[edge.TargetNodeID] = true
	}

	var rootNodes []*models.WorkflowNode

	for _, node := range wg.Nodes {
		if !hasIncoming[node.ID] {
			rootNodes = append(rootNodes, node)
		}
	}

	for _, node := range rootNodes {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": wg.ID,
			"node_id":     node.ID,
		}).Info("→ queueing root node")

		nodeRun, err := s.workflowRunRepo.CreateWorkflowNodeRun(ctx, run.ID, node.ID)
		if err != nil {
			// TODO: can we create these async? technically the task is the important part
			return fmt.Errorf("failed to create node run for node %d: %w", node.ID, err)
		}

		task := models.WorkflowNodeTask{
			WorkflowID: workflowID,
			RunID:      run.ID,
			NodeID:     node.ID,
			NodeRunID:  nodeRun.ID,
		}

		taskBytes, err := json.Marshal(task)
		if err != nil {
			return fmt.Errorf("failed to marshal task for node %d: %w", node.ID, err)
		}

		err = s.rabbitMQClient.Publish(
			ctx,
			"workflow_tasks",
			fmt.Sprintf("node.%s", node.ActionType),
			taskBytes,
		)
		if err != nil {
			return fmt.Errorf("failed to dispatch task for node %d: %w", node.ID, err)
		}

		s.logger.WithFields(logrus.Fields{
			"id":          node.ID,
			"node_run_id": nodeRun.ID,
			"action_type": node.ActionType,
			"config":      node.Config,
		}).Info("→ Dispatched node task")
	}

	return nil
}

var _ models.OrchestratorService = (*OrchestratorService)(nil)
