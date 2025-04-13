package repository

import (
	"context"

	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowRepository interface {
	GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*dao.WorkflowNode, error)
	GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*dao.WorkflowEdge, error)
}

type workflowRepo struct {
	q *dao.Queries
}

func NewWorkflowRepository(q *dao.Queries) WorkflowRepository {
	return &workflowRepo{q}
}

func (r workflowRepo) GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*dao.WorkflowNode, error) {
	return r.q.GetWorkflowNodes(ctx, workflowID)
}

func (r workflowRepo) GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*dao.WorkflowEdge, error) {
	return r.q.GetWorkflowEdges(ctx, workflowID)
}

var _ WorkflowRepository = (*workflowRepo)(nil)
