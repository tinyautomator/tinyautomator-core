package internal

import "github.com/tinyautomator/tinyautomator-core/backend/models"

func GetRootNodes(graph *models.WorkflowGraph) []*models.WorkflowNode {
	targets := make(map[int32]struct{})
	for _, edge := range graph.Edges {
		targets[edge.TargetNodeID] = struct{}{}
	}

	roots := []*models.WorkflowNode{}

	for _, node := range graph.Nodes {
		if _, hasIncoming := targets[node.ID]; !hasIncoming {
			roots = append(roots, node)
		}
	}

	return roots
}
