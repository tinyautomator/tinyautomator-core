package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/yourbasic/graph"
)

type OrchestratorService struct {
	workflowRepo    repositories.WorkflowRepository
	workflowRunRepo repositories.WorkflowRunRepository
	rabbitMQClient  rabbitmq.RabbitMQClient
	logger          logrus.FieldLogger
}

type WorkflowNodeTask struct {
	WorkflowID int32 `json:"workflow_id"`
	RunID      int32 `json:"run_id"`
	NodeID     int32 `json:"node_id"`
	NodeRunID  int32 `json:"node_run_id"`
}

func NewOrchestratorService(cfg config.AppConfig) *OrchestratorService {
	return &OrchestratorService{
		workflowRepo:    cfg.GetWorkflowRepository(),
		workflowRunRepo: cfg.GetWorkflowRunRepository(),
		rabbitMQClient:  cfg.GetRabbitMQClient(),
		logger:          cfg.GetLogger(),
	}
}

func (s *OrchestratorService) ValidateWorkflowGraph(wg *repositories.WorkflowGraph) error {
	idToGraphIdx := make(map[int32]int)
	graphIdxToNode := make(map[int]*dao.WorkflowNode)

	for idx, node := range wg.Nodes {
		idToGraphIdx[node.ID] = idx
		graphIdxToNode[idx] = node
	}

	g := graph.New(len(wg.Nodes))
	hasIncoming := make(map[int32]bool)

	for _, edge := range wg.Edges {
		fromIdx, fromOk := idToGraphIdx[edge.SourceNodeID]
		toIdx, toOk := idToGraphIdx[edge.TargetNodeID]
		hasIncoming[edge.TargetNodeID] = true

		if fromOk && toOk {
			g.Add(fromIdx, toIdx)
		} else {
			s.logger.WithFields(logrus.Fields{
				"workflow_id":    wg.ID,
				"source_node_id": edge.SourceNodeID,
				"target_node_id": edge.TargetNodeID,
			}).Error("invalid edge detected")
		}
	}

	order, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("cycle detected in workflow graph")
	}

	for _, idx := range order {
		node := graphIdxToNode[idx]
		s.logger.WithFields(logrus.Fields{
			"workflow_id": wg.ID,
			"node_id":     node.ID,
		}).Info("validated node")
	}

	return nil
}

func (s *OrchestratorService) OrchestrateWorkflow(ctx context.Context, workflowID int32) error {
	run, err := s.workflowRunRepo.CreateWorkflowRun(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to create workflow run: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": workflowID,
		"run_id":      run.ID,
	}).Info("created workflow run")

	wg, err := s.workflowRepo.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to get workflow graph: %w", err)
	}

	err = s.ValidateWorkflowGraph(wg)
	if err != nil {
		return fmt.Errorf("orchestrate workflow failed to validate workflow graph: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": wg.ID,
		"run_id":      run.ID,
	}).Info("→ executing workflow")

	hasIncoming := make(map[int32]bool)
	for _, edge := range wg.Edges {
		hasIncoming[edge.TargetNodeID] = true
	}

	var rootNodes []*dao.WorkflowNode

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

		task := WorkflowNodeTask{
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
			"config":      string(node.Config),
		}).Info("→ Dispatched node task")
	}

	return nil
}
