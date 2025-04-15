package repository

import (
	"context"

	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowRepository interface {
	GetWorkflow(ctx context.Context, id int64) (*dao.Workflow, error)
	CreateWorkflow(ctx context.Context, arg *dao.CreateWorkflowParams) (*dao.Workflow, error)
	GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*dao.WorkflowNode, error)
	GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*dao.WorkflowEdge, error)
}

type workflowRepo struct {
	q *dao.Queries
}

func NewWorkflowRepository(q *dao.Queries) WorkflowRepository {
	return &workflowRepo{q}
}

func (r *workflowRepo) GetWorkflow(ctx context.Context, id int64) (*dao.Workflow, error) {
	return r.q.GetWorkflow(ctx, id)
}

func (r *workflowRepo) CreateWorkflow(ctx context.Context, arg *dao.CreateWorkflowParams) (*dao.Workflow, error) {
	return r.q.CreateWorkflow(ctx, arg)
}

func (r workflowRepo) GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*dao.WorkflowNode, error) {
	return r.q.GetWorkflowNodes(ctx, workflowID)
}

func (r workflowRepo) GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*dao.WorkflowEdge, error) {
	return r.q.GetWorkflowEdges(ctx, workflowID)
}

var _ WorkflowRepository = (*workflowRepo)(nil)
