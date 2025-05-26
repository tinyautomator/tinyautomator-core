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
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type workflowRunRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
	tx *pgx.Tx
}

func NewWorkflowRunRepository(q *dao.Queries, db *pgxpool.Pool) models.WorkflowRunRepository {
	return &workflowRunRepo{
		q:  q,
		db: db,
		tx: nil,
	}
}

func (r *workflowRunRepo) WithTransaction(
	ctx context.Context,
	fn func(ctx context.Context, txRepo models.WorkflowRunRepository) error,
) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("db error begin tx: %w", err)
	}

	defer func() { _ = tx.Rollback(ctx) }()

	txRepo := &workflowRunRepo{
		q:  r.q.WithTx(tx),
		tx: &tx,
	}

	if err := fn(ctx, txRepo); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("db error commit tx: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) CreateWorkflowRun(
	ctx context.Context,
	workflowID int32,
	nodes []models.ValidateNode,
) (*models.WorkflowRunWithNodesDTO, error) {
	if len(nodes) == 0 {
		return nil, fmt.Errorf("no node ids provided")
	}

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("db error failed to begin tx in create workflow run: %w", err)
	}

	qtx := r.q.WithTx(tx)

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	now := time.Now().UnixMilli()

	run, err := qtx.CreateWorkflowRun(ctx, &dao.CreateWorkflowRunParams{
		WorkflowID: workflowID,
		CreatedAt:  now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow run: %w", err)
	}

	n := make([]*models.WorkflowNodeRunCore, len(nodes))

	for i, node := range nodes {
		nID, err := strconv.ParseInt(node.ID, 10, 32)
		if err != nil {
			return nil, fmt.Errorf("db error parse node id: %w", err)
		}

		status := "pending"
		if node.Category == "trigger" {
			status = "success"
		}

		nr, err := qtx.CreateWorkflowNodeRun(ctx, &dao.CreateWorkflowNodeRunParams{
			WorkflowRunID:  run.ID,
			WorkflowNodeID: int32(nID),
			Status:         status,
		})
		if err != nil {
			return nil, fmt.Errorf("db error create workflow node run: %w", err)
		}

		n[i] = &models.WorkflowNodeRunCore{
			ID:             nr.ID,
			WorkflowRunID:  nr.WorkflowRunID,
			WorkflowNodeID: nr.WorkflowNodeID,
			Status:         nr.Status,
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("db error commit tx in create workflow run: %w", err)
	}

	return &models.WorkflowRunWithNodesDTO{
		WorkflowRunCore: models.WorkflowRunCore{
			ID:         run.ID,
			WorkflowID: run.WorkflowID,
			Status:     run.Status,
		},
		Nodes: n,
	}, nil
}

func (r *workflowRunRepo) CompleteWorkflowRun(
	ctx context.Context,
	workflowRunID int32,
	status string,
) error {
	if err := r.q.CompleteWorkflowRun(ctx, &dao.CompleteWorkflowRunParams{
		ID:         workflowRunID,
		Status:     status,
		FinishedAt: null.IntFrom(time.Now().Unix()),
	}); err != nil {
		return fmt.Errorf("db error complete workflow run: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) GetWorkflowRuns(
	ctx context.Context,
	workflowID int32,
) ([]*models.WorkflowRunCore, error) {
	rows, err := r.q.ListWorkflowRuns(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("db error list workflow runs: %w", err)
	}

	workflowRuns := make([]*models.WorkflowRunCore, len(rows))

	for i, row := range rows {
		workflowRuns[i] = &models.WorkflowRunCore{
			ID:         row.ID,
			WorkflowID: row.WorkflowID,
			Status:     row.Status,
			FinishedAt: null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
			CreatedAt:  time.UnixMilli(row.CreatedAt),
		}
	}

	return workflowRuns, nil
}

func (r *workflowRunRepo) GetWorkflowRun(
	ctx context.Context,
	workflowRunID int32,
) (*models.WorkflowRunWithNodesDTO, error) {
	rows, err := r.q.GetWorkflowRunWithNodeRuns(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow run: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("no rows found for workflow run")
	}

	nodeMap := make(map[int32]*models.WorkflowNodeRunCore)

	for _, row := range rows {
		if _, exists := nodeMap[row.NodeRunID]; !exists {
			nodeMap[row.NodeRunID] = &models.WorkflowNodeRunCore{
				ID:             row.NodeRunID,
				WorkflowRunID:  row.WorkflowRunID,
				WorkflowNodeID: row.WorkflowNodeID,
				Status:         row.NodeRunStatus,
				StartedAt:      null.TimeFrom(time.UnixMilli(row.NodeRunStartedAt.Int64)),
				FinishedAt:     null.TimeFrom(time.UnixMilli(row.NodeRunFinishedAt.Int64)),
				Metadata:       null.StringFrom(string(row.Metadata)),
				ErrorMessage:   null.StringFrom(row.ErrorMessage.String),
			}
		}
	}

	nodes := make([]*models.WorkflowNodeRunCore, 0, len(nodeMap))
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	return &models.WorkflowRunWithNodesDTO{
		WorkflowRunCore: models.WorkflowRunCore{
			ID:         rows[0].WorkflowRunID,
			WorkflowID: rows[0].WorkflowID,
			Status:     rows[0].WorkflowRunStatus,
			FinishedAt: null.TimeFrom(time.UnixMilli(rows[0].WorkflowRunFinishedAt.Int64)),
			CreatedAt:  time.UnixMilli(rows[0].WorkflowRunCreatedAt),
		},
		Nodes: nodes,
	}, nil
}

func (r *workflowRunRepo) GetWorkflowNodeRun(
	ctx context.Context,
	workflowRunID int32,
	nodeID int32,
) (*models.WorkflowNodeRunCore, error) {
	row, err := r.q.GetWorkflowNodeRunByWorkflowRunIDAndNodeID(
		ctx,
		&dao.GetWorkflowNodeRunByWorkflowRunIDAndNodeIDParams{
			WorkflowRunID:  workflowRunID,
			WorkflowNodeID: nodeID,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow node run: %w", err)
	}

	var metadataJSON null.String
	if row.Metadata != nil {
		if err := json.Unmarshal(row.Metadata, &metadataJSON); err != nil {
			return nil, fmt.Errorf("db error unmarshal workflow node run metadata: %w", err)
		}
	}

	return &models.WorkflowNodeRunCore{
		ID:             row.ID,
		WorkflowRunID:  row.WorkflowRunID,
		WorkflowNodeID: row.WorkflowNodeID,
		Status:         row.Status,
		RetryCount:     row.RetryCount,
		StartedAt:      null.TimeFrom(time.UnixMilli(row.StartedAt.Int64)),
		FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
		Metadata:       metadataJSON,
	}, nil
}

func (r *workflowRunRepo) GetWorkflowNodeRuns(
	ctx context.Context,
	workflowRunID int32,
	status *string,
) ([]*models.WorkflowNodeRunCore, error) {
	rows, err := r.q.GetWorkflowNodeRunsByRunID(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow node runs: %w", err)
	}

	workflowRunNodeRuns := []*models.WorkflowNodeRunCore{}

	for _, row := range rows {
		var matadata null.String

		if len(row.Metadata) > 0 {
			var metadataJSON string
			if err := json.Unmarshal(row.Metadata, &metadataJSON); err != nil {
				return nil, fmt.Errorf("db error unmarshal workflow node run metadata: %w", err)
			}

			matadata = null.StringFrom(metadataJSON)
		} else {
			matadata = null.String{}
		}

		if status != nil && *status != row.Status {
			continue
		}

		workflowRunNodeRuns = append(workflowRunNodeRuns, &models.WorkflowNodeRunCore{
			ID:             row.ID,
			WorkflowRunID:  row.WorkflowRunID,
			WorkflowNodeID: row.WorkflowNodeID,
			Status:         row.Status,
			RetryCount:     row.RetryCount,
			StartedAt:      null.TimeFrom(time.UnixMilli(row.StartedAt.Int64)),
			FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
			Metadata:       matadata,
		})
	}

	return workflowRunNodeRuns, nil
}

func (r *workflowRunRepo) GetParentWorkflowNodeRuns(
	ctx context.Context,
	workflowRunID int32,
	nodeID int32,
) ([]*models.WorkflowNodeRunCore, error) {
	rows, err := r.q.GetParentWorkflowNodeRuns(ctx, &dao.GetParentWorkflowNodeRunsParams{
		WorkflowRunID: workflowRunID,
		TargetNodeID:  nodeID,
	})
	if err != nil {
		return nil, fmt.Errorf("db error get parent workflow node runs: %w", err)
	}

	workflowRunNodeRuns := []*models.WorkflowNodeRunCore{}

	for _, row := range rows {
		workflowRunNodeRuns = append(workflowRunNodeRuns, &models.WorkflowNodeRunCore{
			ID:             row.ID,
			WorkflowRunID:  row.WorkflowRunID,
			WorkflowNodeID: row.WorkflowNodeID,
			Status:         row.Status,
			RetryCount:     row.RetryCount,
			StartedAt:      null.TimeFrom(time.UnixMilli(row.StartedAt.Int64)),
			FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
			Metadata:       null.StringFrom(string(row.Metadata)),
			ErrorMessage:   null.StringFrom(row.ErrorMessage.String),
		})
	}

	return workflowRunNodeRuns, nil
}

func (r *workflowRunRepo) GetChildWorkflowNodeRuns(
	ctx context.Context,
	workflowRunID int32,
	nodeID int32,
) ([]*models.WorkflowNodeRunCore, error) {
	rows, err := r.q.GetChildWorkflowNodeRuns(ctx, &dao.GetChildWorkflowNodeRunsParams{
		WorkflowRunID: workflowRunID,
		SourceNodeID:  nodeID,
	})
	if err != nil {
		return nil, fmt.Errorf("db error get child workflow node runs: %w", err)
	}

	workflowRunNodeRuns := []*models.WorkflowNodeRunCore{}

	for _, row := range rows {
		workflowRunNodeRuns = append(workflowRunNodeRuns, &models.WorkflowNodeRunCore{
			ID:             row.ID,
			WorkflowRunID:  row.WorkflowRunID,
			WorkflowNodeID: row.WorkflowNodeID,
			Status:         row.Status,
			RetryCount:     row.RetryCount,
			StartedAt:      null.TimeFrom(time.UnixMilli(row.StartedAt.Int64)),
			FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
			Metadata:       null.StringFrom(string(row.Metadata)),
			ErrorMessage:   null.StringFrom(row.ErrorMessage.String),
		})
	}

	return workflowRunNodeRuns, nil
}

func (r *workflowRunRepo) MarkWorkflowNodeAsRunning(
	ctx context.Context,
	workflowNodeRunID int32,
	startedAt int64,
	retryCount int32,
) error {
	if err := r.q.MarkWorkflowNodeAsRunning(ctx, &dao.MarkWorkflowNodeAsRunningParams{
		ID:         workflowNodeRunID,
		StartedAt:  null.IntFrom(startedAt),
		RetryCount: retryCount,
	}); err != nil {
		return fmt.Errorf("db error mark workflow node as running: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) UpdateWorkflowNodeRunStatus(
	ctx context.Context,
	workflowNodeRunID int32,
	status string,
	errorMessage *string,
) error {
	errMsg := null.String{}
	if errorMessage != nil {
		errMsg = null.StringFrom(*errorMessage)
	}

	if err := r.q.UpdateWorkflowNodeRun(ctx, &dao.UpdateWorkflowNodeRunParams{
		ID:           workflowNodeRunID,
		Status:       status,
		FinishedAt:   null.IntFrom(time.Now().UnixMilli()),
		Metadata:     nil,
		ErrorMessage: errMsg,
	}); err != nil {
		return fmt.Errorf("db error update workflow node run: %w", err)
	}

	return nil
}
