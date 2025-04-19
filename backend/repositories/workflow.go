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

	// Additions
	CreateWorkflowNode(ctx context.Context, arg *dao.CreateWorkflowNodeParams) (*dao.WorkflowNode, error)
	CreateWorkflowNodeUi(ctx context.Context, arg *dao.CreateWorkflowNodeUiParams) (*dao.WorkflowNodeUi, error)
	CreateWorkflowEdge(ctx context.Context, arg *dao.CreateWorkflowEdgeParams) (*dao.WorkflowEdge, error)
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

func (r *workflowRepo) CreateWorkflowNode(ctx context.Context, arg *dao.CreateWorkflowNodeParams) (*dao.WorkflowNode, error) {
	return r.q.CreateWorkflowNode(ctx, arg)
}

func (r *workflowRepo) CreateWorkflowNodeUi(ctx context.Context, arg *dao.CreateWorkflowNodeUiParams) (*dao.WorkflowNodeUi, error) {
	return r.q.CreateWorkflowNodeUi(ctx, arg)
}

func (r *workflowRepo) CreateWorkflowEdge(ctx context.Context, arg *dao.CreateWorkflowEdgeParams) (*dao.WorkflowEdge, error) {
	return r.q.CreateWorkflowEdge(ctx, arg)
}

var _ WorkflowRepository = (*workflowRepo)(nil)
