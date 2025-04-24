package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowNode struct {
	TempID   string `json:"temp_id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Position struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"position"`
	Data struct {
		Label    string `json:"label"`
		Category string `json:"category"`
		Config   string `json:"config"`
		Service  string `json:"service"`
	} `json:"data"`
}

type WorkflowEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type WorkflowRepository interface {
	GetWorkflow(ctx context.Context, id int64) (*dao.Workflow, error)
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		nodes []WorkflowNode,
		edges []WorkflowEdge,
	) (*dao.Workflow, error)
	GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*dao.WorkflowNode, error)
	GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*dao.WorkflowEdge, error)
}

type workflowRepo struct {
	q  *dao.Queries
	db *sql.DB
}

func NewWorkflowRepository(q *dao.Queries, db *sql.DB) WorkflowRepository {
	return &workflowRepo{q, db}
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
	userID string,
	name string,
	description string,
	nodes []WorkflowNode,
	edges []WorkflowEdge,
) (*dao.Workflow, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction in create workflow: %w", err)
	}

	qtx := r.q.WithTx(tx)

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	now := time.Now().UnixMilli()

	w, err := qtx.CreateWorkflow(ctx, &dao.CreateWorkflowParams{
		UserID:      userID,
		Name:        name,
		Description: null.StringFrom(description),
		CreatedAt:   sql.NullInt64{Int64: now, Valid: true},
		UpdatedAt:   sql.NullInt64{Int64: now, Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow: %w", err)
	}

	createdNodeIDMap := make(map[string]int64)

	for _, node := range nodes {
		n, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: w.ID,
			Name:       null.StringFrom(node.Name),
			Type:       node.Type,
			Category:   node.Data.Category,
			Service:    null.StringFrom(node.Data.Service),
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow nodes: %w", err)
		}

		createdNodeIDMap[node.TempID] = n.ID

		_, err = qtx.CreateWorkflowNodeUi(ctx, &dao.CreateWorkflowNodeUiParams{
			XPosition: node.Position.X,
			YPosition: node.Position.Y,
			NodeLabel: null.StringFrom(node.Data.Label),
			NodeType:  node.Type,
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow node ui: %w", err)
		}
	}

	for _, edge := range edges {
		_, err = qtx.CreateWorkflowEdge(ctx, &dao.CreateWorkflowEdgeParams{
			WorkflowID:   w.ID,
			SourceNodeID: createdNodeIDMap[edge.Source],
			TargetNodeID: createdNodeIDMap[edge.Target],
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow edges: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction in create workflow: %w", err)
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
