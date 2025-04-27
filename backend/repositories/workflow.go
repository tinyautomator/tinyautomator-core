package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowGraph struct {
	ID    int32
	Nodes []*dao.WorkflowNode
	Edges []*dao.WorkflowEdge
}

type WorkflowNode struct {
	TempID   string `json:"temp_id"`
	Type     string `json:"type"`
	Position struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"position"`
	Data struct {
		Label      string `json:"label"`
		ActionType string `json:"action_type"`
		Config     string `json:"config"`
	} `json:"data"`
}

type WorkflowEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type WorkflowRepository interface {
	GetWorkflow(ctx context.Context, id int32) (*dao.Workflow, error)
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		nodes []WorkflowNode,
		edges []WorkflowEdge,
	) (*dao.Workflow, error)
	GetWorkflowGraph(ctx context.Context, workflowID int32) (*WorkflowGraph, error)
}

type workflowRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowRepository(q *dao.Queries, pool *pgxpool.Pool) WorkflowRepository {
	return &workflowRepo{q, pool}
}

func (r *workflowRepo) GetWorkflow(ctx context.Context, id int32) (*dao.Workflow, error) {
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
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction in create workflow: %w", err)
	}

	qtx := r.q.WithTx(tx)

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	now := time.Now().UnixMilli()

	w, err := qtx.CreateWorkflow(ctx, &dao.CreateWorkflowParams{
		UserID:      userID,
		Name:        name,
		Description: null.StringFrom(description),
		CreatedAt:   null.IntFrom(now),
		UpdatedAt:   null.IntFrom(now),
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow: %w", err)
	}

	createdNodeIDMap := make(map[string]int32)

	for _, node := range nodes {
		n, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: w.ID,
			ActionType: node.Data.ActionType,
			Config:     []byte(node.Data.Config),
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow nodes: %w", err)
		}

		createdNodeIDMap[node.TempID] = n.ID

		_, err = qtx.CreateWorkflowNodeUi(ctx, &dao.CreateWorkflowNodeUiParams{
			ID:        n.ID,
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

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction in create workflow: %w", err)
	}

	return w, nil
}

func (r workflowRepo) GetWorkflowGraph(
	ctx context.Context,
	workflowID int32,
) (*WorkflowGraph, error) {
	rows, err := r.q.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("error loading workflow graph from db: %w", err)
	}
	// TODO: check for no rows

	nodeMap := make(map[int32]*dao.WorkflowNode)

	var edges []*dao.WorkflowEdge

	for _, row := range rows {
		if _, exists := nodeMap[row.NodeID]; !exists {
			nodeMap[row.NodeID] = &dao.WorkflowNode{
				ID:         row.NodeID,
				ActionType: row.ActionType,
				Config:     row.Config,
				WorkflowID: row.WorkflowID,
			}
		}

		if row.SourceNodeID.Valid && row.TargetNodeID.Valid {
			edges = append(edges, &dao.WorkflowEdge{
				SourceNodeID: row.SourceNodeID.Int32,
				TargetNodeID: row.TargetNodeID.Int32,
				WorkflowID:   row.WorkflowID,
			})
		}
	}

	var nodes []*dao.WorkflowNode
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	return &WorkflowGraph{
		ID:    workflowID,
		Nodes: nodes,
		Edges: edges,
	}, nil
}

var _ WorkflowRepository = (*workflowRepo)(nil)
