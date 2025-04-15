package workflow

import (
	"fmt"

	"github.com/sirupsen/logrus"
	cfg "github.com/tinyautomator/tinyautomator-core/backend/config"

	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/yourbasic/graph"
)

func ExecuteWorkflow(cfg cfg.AppConfig, nodes []*dao.WorkflowNode, edges []*dao.WorkflowEdge) error {
	// Build ID ↔ Index maps
	idToIndex := make(map[int64]int)
	indexToNode := make(map[int]*dao.WorkflowNode)

	for i, node := range nodes {
		idToIndex[node.ID] = i
		indexToNode[i] = node
	}

	// Build the graph
	g := graph.New(len(nodes))
	for _, edge := range edges {
		from, fromOk := idToIndex[edge.SourceNodeID]
		to, toOk := idToIndex[edge.TargetNodeID]
		if fromOk && toOk {
			g.Add(from, to)
		} else {
			cfg.Log().WithField("edge", edge).Warn("Skipping invalid edge")
		}
	}

	// Topologically sort
	order, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("cycle detected in workflow graph")
	}

	// Execute in order
	cfg.Log().Info("Executing workflow:")
	for _, idx := range order {
		node := indexToNode[idx]
		// TODO: Plug in actual logic for triggers/actions/custom
		cfg.Log().WithFields(logrus.Fields{
			"id":       node.ID,
			"type":     node.Type,
			"name":     node.Name.ValueOrZero(),
			"category": node.Category,
			"service":  node.Service.String,
		}).Info("→ Executing node")
	}

	return nil
}
