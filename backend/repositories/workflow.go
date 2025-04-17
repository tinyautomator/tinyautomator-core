package repositories

import (
	"context"
	"fmt"

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
	w, err := r.q.GetWorkflow(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow: %w", err)
	}

	return w, nil
}

func (r *workflowRepo) CreateWorkflow(
	ctx context.Context,
	arg *dao.CreateWorkflowParams,
) (*dao.Workflow, error) {
	w, err := r.q.CreateWorkflow(ctx, arg)
	if err != nil {
		return nil, fmt.Errorf("db error create workflow: %w", err)
	}

	return w, nil
}

func (r workflowRepo) GetWorkflowNodes(
	ctx context.Context,
	workflowID int64,
) ([]*dao.WorkflowNode, error) {
	w, err := r.q.GetWorkflowNodes(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow nodes: %w", err)
	}

	return w, nil
}

func (r workflowRepo) GetWorkflowEdges(
	ctx context.Context,
	workflowID int64,
) ([]*dao.WorkflowEdge, error) {
	w, err := r.q.GetWorkflowEdges(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow edges: %w", err)
	}

	return w, nil
}

var _ WorkflowRepository = (*workflowRepo)(nil)
