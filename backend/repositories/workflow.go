package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type Workflow struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type WorkflowGraph struct {
	ID    int32
	Nodes []*dao.WorkflowNode
	Edges []*dao.WorkflowEdge
}

type RenderedWorkflowGraph struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Nodes       []WorkflowNode `json:"nodes"`
	Edges       []WorkflowEdge `json:"edges"`
}

type WorkflowNodePosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type WorkflowNodeData struct {
	Label      string `json:"label"`
	ActionType string `json:"actionType"`
	Config     string `json:"config"`
}

type WorkflowNode struct {
	TempID   string               `json:"id"`
	Position WorkflowNodePosition `json:"position"`
	Data     WorkflowNodeData     `json:"data"`
}

type WorkflowEdge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

type WorkflowDelta struct {
	Name            string
	Description     string
	UpdateMetadata  bool
	NodesToCreate   []WorkflowNode
	NodesToUpdate   []WorkflowNode
	NodesToUpdateUI []WorkflowNode
	NodeIDsToDelete []int32
	EdgesToAdd      []WorkflowEdge
	EdgesToDelete   []WorkflowEdge
}

type WorkflowRepository interface {
	GetWorkflow(ctx context.Context, id int32) (*dao.Workflow, error)
	GetUserWorkflows(ctx context.Context, userID string) ([]Workflow, error)
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		nodes []WorkflowNode,
		edges []WorkflowEdge,
	) (*dao.Workflow, error)
	UpdateWorkflow(
		ctx context.Context,
		workflowID int32,
		delta WorkflowDelta,
		existingNodes []WorkflowNode,
	) error
	GetWorkflowGraph(ctx context.Context, workflowID int32) (*WorkflowGraph, error)
	RenderWorkflowGraph(ctx context.Context, workflowID int32) (*RenderedWorkflowGraph, error)
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

func (r *workflowRepo) GetUserWorkflows(ctx context.Context, userID string) ([]Workflow, error) {
	w, err := r.q.GetUserWorkflows(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflows for user: %w", err)
	}

	workflows := make([]Workflow, len(w))
	for i, w := range w {
		workflows[i] = Workflow{
			ID:          w.ID,
			Name:        w.Name,
			Description: w.Description.String,
		}
	}

	return workflows, nil
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
		config, err := json.Marshal(node.Data.Config)
		if err != nil {
			return nil, fmt.Errorf("error marshalling config: %w", err)
		}

		n, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: w.ID,
			ActionType: node.Data.ActionType,
			Config:     config,
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow nodes: %w", err)
		}

		createdNodeIDMap[node.TempID] = n.ID

		_, err = qtx.CreateWorkflowNodeUi(ctx, &dao.CreateWorkflowNodeUiParams{
			ID:        n.ID,
			XPosition: node.Position.X,
			YPosition: node.Position.Y,
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

func (r workflowRepo) UpdateWorkflow(
	ctx context.Context,
	workflowID int32,
	delta WorkflowDelta,
	existingNodes []WorkflowNode,
) error {
	fmt.Println("delta name", delta.Name)
	fmt.Println("delta description", delta.Description)
	fmt.Println("delta update metadata", delta.UpdateMetadata)
	fmt.Println("delta nodes to create", delta.NodesToCreate)
	fmt.Println("delta nodes to update", delta.NodesToUpdate)
	fmt.Println("delta nodes to update ui", delta.NodesToUpdateUI)
	fmt.Println("delta node ids to delete", delta.NodeIDsToDelete)
	fmt.Println("delta edges to add", delta.EdgesToAdd)
	fmt.Println("delta edges to delete", delta.EdgesToDelete)

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("begin tx failed: %w", err)
	}

	qtx := r.q.WithTx(tx)

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	now := time.Now().UnixMilli()

	if delta.UpdateMetadata {
		err = qtx.UpdateWorkflow(ctx, &dao.UpdateWorkflowParams{
			ID:          workflowID,
			Name:        delta.Name,
			Description: null.StringFrom(delta.Description),
			UpdatedAt:   null.IntFrom(now),
		})
		if err != nil {
			return fmt.Errorf("db error update workflow metadata: %w", err)
		}
	}

	for _, id := range delta.NodeIDsToDelete {
		err = qtx.DeleteWorkflowNode(ctx, id)
		if err != nil {
			return fmt.Errorf("db error delete workflow node: %w", err)
		}
	}

	nodeIDMap := make(map[string]int32)

	for _, n := range existingNodes {
		id, err := strconv.Atoi(n.TempID)
		if err != nil {
			return fmt.Errorf("invalid node id: %w", err)
		}

		nodeIDMap[n.TempID] = int32(id)
	}

	for _, n := range delta.NodesToCreate {
		newNode, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: workflowID,
			ActionType: n.Data.ActionType,
			Config:     []byte(n.Data.Config),
		})
		if err != nil {
			return fmt.Errorf("db error create workflow node: %w", err)
		}

		nodeIDMap[n.TempID] = newNode.ID

		_, err = qtx.CreateWorkflowNodeUi(ctx, &dao.CreateWorkflowNodeUiParams{
			ID:        newNode.ID,
			XPosition: n.Position.X,
			YPosition: n.Position.Y,
		})
		if err != nil {
			return fmt.Errorf("db error create workflow node ui: %w", err)
		}
	}

	for _, n := range delta.NodesToUpdate {
		nID, err := strconv.Atoi(n.TempID)
		if err != nil {
			return fmt.Errorf("invalid node id: %w", err)
		}

		err = qtx.UpdateWorkflowNode(ctx, &dao.UpdateWorkflowNodeParams{
			ID:         int32(nID),
			ActionType: n.Data.ActionType,
			Config:     []byte(n.Data.Config),
		})
		if err != nil {
			return fmt.Errorf("db error update workflow node: %w", err)
		}

		err = qtx.UpdateWorkflowNodeUI(ctx, &dao.UpdateWorkflowNodeUIParams{
			ID:        int32(nID),
			XPosition: n.Position.X,
			YPosition: n.Position.Y,
		})
		if err != nil {
			return fmt.Errorf("db error update workflow node ui: %w", err)
		}
	}

	for _, n := range delta.NodesToUpdateUI {
		nID, err := strconv.Atoi(n.TempID)
		if err != nil {
			return fmt.Errorf("invalid node id: %w", err)
		}

		err = qtx.UpdateWorkflowNodeUI(ctx, &dao.UpdateWorkflowNodeUIParams{
			ID:        int32(nID),
			XPosition: n.Position.X,
			YPosition: n.Position.Y,
		})
		if err != nil {
			return fmt.Errorf("db error update workflow node ui: %w", err)
		}
	}

	for _, e := range delta.EdgesToDelete {
		src, err := strconv.Atoi(e.Source)
		if err != nil {
			return fmt.Errorf("invalid edge source id: %w", err)
		}

		dst, err := strconv.Atoi(e.Target)
		if err != nil {
			return fmt.Errorf("invalid edge target id: %w", err)
		}

		err = qtx.DeleteWorkflowEdge(ctx, &dao.DeleteWorkflowEdgeParams{
			WorkflowID:   workflowID,
			SourceNodeID: int32(src),
			TargetNodeID: int32(dst),
		})
		if err != nil {
			return fmt.Errorf("db error delete workflow edge: %w", err)
		}
	}

	for _, e := range delta.EdgesToAdd {
		_, err = qtx.CreateWorkflowEdge(ctx, &dao.CreateWorkflowEdgeParams{
			WorkflowID:   workflowID,
			SourceNodeID: nodeIDMap[e.Source],
			TargetNodeID: nodeIDMap[e.Target],
		})
		if err != nil {
			return fmt.Errorf("db error create workflow edges: %w", err)
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx failed: %w", err)
	}

	return nil
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

func (r workflowRepo) RenderWorkflowGraph(
	ctx context.Context,
	workflowID int32,
) (*RenderedWorkflowGraph, error) {
	rows, err := r.q.RenderWorkflowGraph(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("error loading workflow graph from db: %w", err)
	}
	// TODO: check for no rows

	nodeMap := make(map[int32]WorkflowNode)

	var workflowName string

	var workflowDescription string

	var edges []WorkflowEdge

	for _, row := range rows {
		if workflowName == "" {
			workflowName = row.WorkflowName
		}

		if workflowDescription == "" {
			workflowDescription = row.WorkflowDescription.String
		}

		if _, exists := nodeMap[row.NodeID]; !exists {
			nodeMap[row.NodeID] = WorkflowNode{
				TempID: fmt.Sprintf("%d", row.NodeID),
				Position: WorkflowNodePosition{
					X: row.XPosition,
					Y: row.YPosition,
				},
				Data: WorkflowNodeData{
					ActionType: row.ActionType,
					Config:     string(row.Config),
				},
			}
		}

		if row.SourceNodeID.Valid && row.TargetNodeID.Valid {
			edges = append(edges, WorkflowEdge{
				ID:     fmt.Sprintf("%d-%d", row.SourceNodeID.Int32, row.TargetNodeID.Int32),
				Source: fmt.Sprintf("%d", row.SourceNodeID.Int32),
				Target: fmt.Sprintf("%d", row.TargetNodeID.Int32),
			})
		}
	}

	var nodes []WorkflowNode
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	return &RenderedWorkflowGraph{
		Name:        workflowName,
		Description: workflowDescription,
		ID:          workflowID,
		Nodes:       nodes,
		Edges:       edges,
	}, nil
}

var _ WorkflowRepository = (*workflowRepo)(nil)
