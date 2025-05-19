package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type workflowRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowRepository(q *dao.Queries, pool *pgxpool.Pool) models.WorkflowRepository {
	return &workflowRepo{q, pool}
}

func (r *workflowRepo) GetWorkflow(ctx context.Context, id int32) (*models.Workflow, error) {
	w, err := r.q.GetWorkflow(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow: %w", err)
	}

	m := &models.Workflow{}
	m.ID = w.ID
	m.Name = w.Name
	m.Description = w.Description
	m.Status = w.Status
	m.CreatedAt = w.CreatedAt
	m.UpdatedAt = w.UpdatedAt
	m.UserID = w.UserID

	return m, nil
}

func (r *workflowRepo) GetUserWorkflows(
	ctx context.Context,
	userID string,
) ([]*models.Workflow, error) {
	w, err := r.q.GetUserWorkflows(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflows for user: %w", err)
	}

	workflows := make([]*models.Workflow, len(w))

	for i, _w := range w {
		w := &models.Workflow{}
		w.ID = _w.ID
		w.Name = _w.Name
		w.Description = _w.Description
		w.Status = _w.Status
		w.CreatedAt = _w.CreatedAt
		w.UpdatedAt = _w.UpdatedAt
		w.UserID = _w.UserID
		workflows[i] = w
	}

	return workflows, nil
}

func (r *workflowRepo) GetChildNodeIDs(ctx context.Context, nodeID int32) ([]int32, error) {
	ids, err := r.q.GetChildNodeIDs(ctx, nodeID)
	if err != nil {
		return nil, fmt.Errorf("db error get child node ids: %w", err)
	}

	return ids, nil
}

func (r *workflowRepo) CreateWorkflow(
	ctx context.Context,
	userID string,
	name string,
	description string,
	status string,
	nodes []*models.WorkflowNodeDTO,
	edges []*models.WorkflowEdgeDTO,
) (*models.Workflow, error) {
	if userID == "" || name == "" || description == "" || status == "" {
		return nil, fmt.Errorf("workflow metadata is missing")
	}

	if len(nodes) == 0 {
		return nil, fmt.Errorf("no workflow nodes to create")
	}

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
		Description: description,
		Status:      status,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow: %w", err)
	}

	createdNodeIDMap := make(map[string]int32)

	for _, node := range nodes {
		if node.ActionType == "" {
			return nil, fmt.Errorf("node action type is missing for node %s", node.ID)
		}

		if node.Config == nil {
			return nil, fmt.Errorf("node config is missing for node %s", node.ID)
		}

		config, err := json.Marshal(node.Config)
		if err != nil {
			return nil, fmt.Errorf("error marshalling config: %w", err)
		}

		n, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: w.ID,
			ActionType: node.ActionType,
			Config:     config,
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow nodes: %w", err)
		}

		createdNodeIDMap[node.ID] = n.ID

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
		if edge.SourceNodeID == "" || edge.TargetNodeID == "" {
			return nil, fmt.Errorf("edge source or target node ID is missing for edge %s", edge.ID)
		}

		_, err = qtx.CreateWorkflowEdge(ctx, &dao.CreateWorkflowEdgeParams{
			WorkflowID:   w.ID,
			SourceNodeID: createdNodeIDMap[edge.SourceNodeID],
			TargetNodeID: createdNodeIDMap[edge.TargetNodeID],
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow edges: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction in create workflow: %w", err)
	}

	m := &models.Workflow{}
	m.ID = w.ID
	m.Name = w.Name
	m.Description = w.Description
	m.Status = w.Status
	m.CreatedAt = w.CreatedAt
	m.UpdatedAt = w.UpdatedAt
	m.UserID = w.UserID

	return m, nil
}

func (r workflowRepo) UpdateWorkflow(
	ctx context.Context,
	workflowID int32,
	delta *models.WorkflowDelta,
	existingNodes []*models.WorkflowNodeDTO,
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
			Description: delta.Description,
			UpdatedAt:   now,
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
		id, err := strconv.Atoi(n.ID)
		if err != nil {
			return fmt.Errorf("invalid node id: %w", err)
		}

		nodeIDMap[n.ID] = int32(id)
	}

	for _, n := range delta.NodesToCreate {
		config, err := json.Marshal(n.Config)
		if err != nil {
			return fmt.Errorf("error marshalling config: %w", err)
		}

		newNode, err := qtx.CreateWorkflowNode(ctx, &dao.CreateWorkflowNodeParams{
			WorkflowID: workflowID,
			ActionType: n.ActionType,
			Config:     config,
		})
		if err != nil {
			return fmt.Errorf("db error create workflow node: %w", err)
		}

		nodeIDMap[n.ID] = newNode.ID

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
		nID, err := strconv.Atoi(n.ID)
		if err != nil {
			return fmt.Errorf("invalid node id: %w", err)
		}

		config, err := json.Marshal(n.Config)
		if err != nil {
			return fmt.Errorf("error marshalling config: %w", err)
		}

		err = qtx.UpdateWorkflowNode(ctx, &dao.UpdateWorkflowNodeParams{
			ID:         int32(nID),
			ActionType: n.ActionType,
			Config:     config,
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
		nID, err := strconv.Atoi(n.ID)
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
		src, err := strconv.Atoi(e.SourceNodeID)
		if err != nil {
			return fmt.Errorf("invalid edge source id: %w", err)
		}

		dst, err := strconv.Atoi(e.TargetNodeID)
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
			SourceNodeID: nodeIDMap[e.SourceNodeID],
			TargetNodeID: nodeIDMap[e.TargetNodeID],
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
) (*models.WorkflowGraph, error) {
	rows, err := r.q.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("error loading workflow graph from db: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("no rows found for workflow graph")
	}

	nodeMap := make(map[int32]*models.WorkflowNode)

	var edges []*models.WorkflowEdge

	for _, row := range rows {
		if _, exists := nodeMap[row.NodeID]; !exists {
			config := make(map[string]any)
			if err := json.Unmarshal(row.Config, &config); err != nil {
				return nil, fmt.Errorf("error unmarshalling config: %w", err)
			}

			wn := &models.WorkflowNode{}
			wn.ID = row.NodeID
			wn.ActionType = row.ActionType
			wn.WorkflowID = row.WorkflowID
			wn.Config = &config

			nodeMap[row.NodeID] = wn
		}

		if row.SourceNodeID.Valid && row.TargetNodeID.Valid {
			edges = append(edges, &models.WorkflowEdge{
				SourceNodeID: row.SourceNodeID.Int32,
				TargetNodeID: row.TargetNodeID.Int32,
				WorkflowID:   row.WorkflowID,
			})
		}
	}

	nodes := make([]*models.WorkflowNode, 0, len(nodeMap))
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	return &models.WorkflowGraph{
		ID:    workflowID,
		Nodes: nodes,
		Edges: edges,
	}, nil
}

func (r workflowRepo) RenderWorkflowGraph(
	ctx context.Context,
	workflowID int32,
) (*models.WorkflowGraphDTO, error) {
	rows, err := r.q.RenderWorkflowGraph(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("error loading workflow graph from db: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("no rows found for rendered workflow graph")
	}

	nodeMap := make(map[int32]*models.WorkflowNodeDTO)

	var workflowName string

	var workflowDescription string

	var edges []*models.WorkflowEdgeDTO

	for _, row := range rows {
		if workflowName == "" {
			workflowName = row.WorkflowName
		}

		if workflowDescription == "" {
			workflowDescription = row.WorkflowDescription
		}

		if _, exists := nodeMap[row.NodeID]; !exists {
			config := make(map[string]any)
			if err := json.Unmarshal(row.Config, &config); err != nil {
				return nil, fmt.Errorf("error unmarshalling config: %w", err)
			}

			wn := &models.WorkflowNodeDTO{}
			wn.ID = fmt.Sprintf("%d", row.NodeID)
			wn.ActionType = row.ActionType
			wn.Config = &config
			wn.Position = &models.WorkflowNodePosition{
				X: row.XPosition,
				Y: row.YPosition,
			}

			nodeMap[row.NodeID] = wn
		}

		if row.SourceNodeID.Valid && row.TargetNodeID.Valid {
			edges = append(edges, &models.WorkflowEdgeDTO{
				ID:           fmt.Sprintf("%d-%d", row.SourceNodeID.Int32, row.TargetNodeID.Int32),
				SourceNodeID: fmt.Sprintf("%d", row.SourceNodeID.Int32),
				TargetNodeID: fmt.Sprintf("%d", row.TargetNodeID.Int32),
			})
		}
	}

	nodes := make([]*models.WorkflowNodeDTO, 0, len(nodeMap))
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	return &models.WorkflowGraphDTO{
		Name:        workflowName,
		Description: workflowDescription,
		ID:          workflowID,
		Nodes:       nodes,
		Edges:       edges,
	}, nil
}

var _ models.WorkflowRepository = (*workflowRepo)(nil)
