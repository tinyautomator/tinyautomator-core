package workflow

import (
	"context"
	"fmt"

	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	repository "github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

func LoadWorkflowGraph(ctx context.Context, repo repository.WorkflowRepository, workflowID int64) ([]*dao.WorkflowNode, []*dao.WorkflowEdge, error) {
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
