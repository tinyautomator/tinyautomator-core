package services

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	cfg "github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	repository "github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/yourbasic/graph"
)

func LoadWorkflowGraph(
	ctx context.Context,
	repo repository.WorkflowRepository,
	workflowID int64,
) ([]*dao.WorkflowNode, []*dao.WorkflowEdge, error) {
	nodes, err := repo.GetWorkflowNodes(ctx, workflowID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load workflow nodes: %w", err)
	}

	edges, err := repo.GetWorkflowEdges(ctx, workflowID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load workflow edges: %w", err)
	}

	return nodes, edges, nil
}

func ExecuteWorkflow(
	cfg cfg.AppConfig,
	nodes []*dao.WorkflowNode,
	edges []*dao.WorkflowEdge,
) error {
	idToIndex := make(map[int64]int)
	indexToNode := make(map[int]*dao.WorkflowNode)

	for i, node := range nodes {
		idToIndex[node.ID] = i
		indexToNode[i] = node
	}

	g := graph.New(len(nodes))

	for _, edge := range edges {
		from, fromOk := idToIndex[edge.SourceNodeID]
		to, toOk := idToIndex[edge.TargetNodeID]
		if fromOk && toOk {
			g.Add(from, to)
		} else {
			cfg.GetLogger().WithField("edge", edge).Warn("Skipping invalid edge")
		}
	}

	order, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("cycle detected in workflow graph")
	}

	cfg.GetLogger().Info("Executing workflow:")
	for _, idx := range order {
		node := indexToNode[idx]
		// TODO: Plug in actual logic for triggers/actions/custom
		cfg.GetLogger().WithFields(logrus.Fields{
			"id":       node.ID,
			"type":     node.Type,
			"name":     node.Name.ValueOrZero(),
			"category": node.Category,
			"service":  node.Service.String,
		}).Info("→ Executing node")
	}

	return nil
}
