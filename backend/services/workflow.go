package services

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/yourbasic/graph"
)

type WorkflowService struct {
	logger       logrus.FieldLogger
	workflowRepo repositories.WorkflowRepository
	orchestrator *OrchestratorService
}

func NewWorkflowService(cfg config.AppConfig) *WorkflowService {
	return &WorkflowService{
		logger:       cfg.GetLogger(),
		workflowRepo: cfg.GetWorkflowRepository(),
		orchestrator: NewOrchestratorService(cfg),
	}
}

func (s *WorkflowService) ValidateWorkflowGraph(
	nodes []repositories.WorkflowNode,
	edges []repositories.WorkflowEdge,
) error {
	idToGraphIdx := make(map[string]int)
	graphIdxToNode := make(map[int]repositories.WorkflowNode)

	for idx, node := range nodes {
		idToGraphIdx[node.TempID] = idx
		graphIdxToNode[idx] = node
	}

	g := graph.New(len(nodes))

	for _, edge := range edges {
		fromIdx, fromOk := idToGraphIdx[edge.Source]
		toIdx, toOk := idToGraphIdx[edge.Target]

		if fromOk && toOk {
			g.Add(fromIdx, toIdx)
		} else {
			s.logger.WithFields(logrus.Fields{
				"source_node_id": edge.Source,
				"target_node_id": edge.Target,
			}).Error("invalid edge detected")
		}
	}

	order, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("cycle detected in workflow graph")
	}

	s.logger.WithField("order", order).Info("validated workflow graph")

	return nil
}

func (s *WorkflowService) CreateWorkflow(
	ctx context.Context,
	userID string,
	name string,
	description string,
	status string,
	nodes []repositories.WorkflowNode,
	edges []repositories.WorkflowEdge,
) (*dao.Workflow, error) {
	if err := s.ValidateWorkflowGraph(nodes, edges); err != nil {
		return nil, fmt.Errorf("failed to validate workflow graph: %w", err)
	}

	w, err := s.workflowRepo.CreateWorkflow(ctx, userID, name, description, status, nodes, edges)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	return w, nil
}
