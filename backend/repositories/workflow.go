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
	dao.Querier
}

var _ WorkflowRepository = (*workflowRepo)(nil)
