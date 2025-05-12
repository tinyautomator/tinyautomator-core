package services

import (
	"context"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/yourbasic/graph"
)

type WorkflowExecutorService struct {
	workflowRepo repositories.WorkflowRepository
	logger       logrus.FieldLogger
}

func NewWorkflowExecutorService(cfg config.AppConfig) *WorkflowExecutorService {
	return &WorkflowExecutorService{
		workflowRepo: cfg.GetWorkflowRepository(),
		logger:       cfg.GetLogger(),
	}
}

func (s *WorkflowExecutorService) ExecuteWorkflow(ctx context.Context, workflowID int32) error {
	wg, err := s.workflowRepo.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("error in workflow executor: %w", err)
	}

	idToGraphIdx := make(map[int32]int)
	graphIdxToNode := make(map[int]*dao.WorkflowNode)

	for idx, node := range wg.Nodes {
		idToGraphIdx[node.ID] = idx
		graphIdxToNode[idx] = node
	}

	g := graph.New(len(wg.Nodes))

	for _, edge := range wg.Edges {
		fromIdx, fromOk := idToGraphIdx[edge.SourceNodeID]
		toIdx, toOk := idToGraphIdx[edge.TargetNodeID]

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

	s.logger.WithFields(logrus.Fields{"workflow_id": wg.ID}).Info("→ executing workflow")

	for _, idx := range order {
		node := graphIdxToNode[idx]
		s.logger.WithFields(logrus.Fields{
			"id":          node.ID,
			"action_type": node.ActionType,
			"config":      string(node.Config),
		}).Info("→ Executing node")
		time.Sleep(7 * time.Second)
	}

	return nil
}
