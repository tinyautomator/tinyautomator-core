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

type SortableNode interface {
	ID() int32
}

type SortableEdge interface {
	SourceNodeID() int32
	TargetNodeID() int32
}

func NewWorkflowService(cfg config.AppConfig) *WorkflowService {
	return &WorkflowService{
		logger:       cfg.GetLogger(),
		workflowRepo: cfg.GetWorkflowRepository(),
		orchestrator: NewOrchestratorService(cfg),
	}
}

func (s *WorkflowService) ValidateWorkflowGraph(
	nodes []SortableNode,
	edges []SortableEdge,
) error {
	idToGraphIdx := make(map[int32]int)
	graphIdxToNode := make(map[int]SortableNode)

	for idx, node := range nodes {
		idToGraphIdx[node.ID()] = idx
		graphIdxToNode[idx] = node
	}

	g := graph.New(len(nodes))

	for _, edge := range edges {
		fromIdx, fromOk := idToGraphIdx[edge.SourceNodeID()]
		toIdx, toOk := idToGraphIdx[edge.TargetNodeID()]

		if fromOk && toOk {
			g.Add(fromIdx, toIdx)
		} else {
			s.logger.WithFields(logrus.Fields{
				"source_node_id": edge.SourceNodeID,
				"target_node_id": edge.TargetNodeID,
			}).Error("invalid edge detected")
		}
	}

	_, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("cycle detected in workflow graph")
	}

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
	w, err := s.workflowRepo.CreateWorkflow(ctx, userID, name, description, status, nodes, edges)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	return w, nil
}
