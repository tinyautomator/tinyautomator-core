package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/internal"
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
) (*models.WorkflowRun, error) {
	now := time.Now().Unix()

	run, err := r.q.CreateWorkflowRun(ctx, &dao.CreateWorkflowRunParams{
		WorkflowID: workflowID,
		StartedAt:  now,
		CreatedAt:  now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow run: %w", err)
	}

	return &models.WorkflowRun{
		ID:         run.ID,
		WorkflowID: run.WorkflowID,
		Status:     run.Status,
		StartedAt:  time.UnixMilli(run.StartedAt),
		FinishedAt: null.TimeFrom(time.UnixMilli(run.FinishedAt.Int64)),
	}, nil
}

func (r *workflowRunRepo) CreateWorkflowNodeRun(
	ctx context.Context,
	workflowRunID int32,
	workflowNodeID int32,
) (*int32, error) {
	now := time.Now().Unix()

	runID, err := r.q.CreateWorkflowNodeRun(ctx, &dao.CreateWorkflowNodeRunParams{
		WorkflowRunID:  workflowRunID,
		WorkflowNodeID: workflowNodeID,
		StartedAt:      now,
		Metadata:       nil,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, internal.ErrNodeRunAlreadyExists
		}

		return nil, fmt.Errorf("db error create workflow node run: %w", err)
	}

	return &runID, nil
}

func (r *workflowRunRepo) CompleteWorkflowRun(ctx context.Context, workflowRunID int32) error {
	if err := r.q.CompleteWorkflowRun(ctx, &dao.CompleteWorkflowRunParams{
		ID:         workflowRunID,
		Status:     "success",
		FinishedAt: null.IntFrom(time.Now().Unix()),
	}); err != nil {
		return fmt.Errorf("db error complete workflow run: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) CompleteWorkflowNodeRun(
	ctx context.Context,
	workflowNodeRunID int32,
) error {
	if err := r.q.CompleteWorkflowNodeRun(ctx, &dao.CompleteWorkflowNodeRunParams{
		ID:         workflowNodeRunID,
		Status:     "success",
		FinishedAt: null.IntFrom(time.Now().Unix()),
	}); err != nil {
		return fmt.Errorf("db error complete workflow node run: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) GetWorkflowRuns(
	ctx context.Context,
	workflowID int32,
) ([]*models.WorkflowRun, error) {
	rows, err := r.q.ListWorkflowRuns(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("db error list workflow runs: %w", err)
	}

	workflowRuns := make([]*models.WorkflowRun, len(rows))

	for i, row := range rows {
		workflowRuns[i] = &models.WorkflowRun{
			ID:         row.ID,
			WorkflowID: row.WorkflowID,
			Status:     row.Status,
			StartedAt:  time.UnixMilli(row.StartedAt),
			FinishedAt: null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
		}
	}

	return workflowRuns, nil
}

func (r *workflowRunRepo) GetWorkflowRun(
	ctx context.Context,
	workflowRunID int32,
) (*models.WorkflowRun, error) {
	run, err := r.q.GetWorkflowRun(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow run: %w", err)
	}

	return &models.WorkflowRun{
		ID:         run.ID,
		WorkflowID: run.WorkflowID,
		Status:     run.Status,
		StartedAt:  time.UnixMilli(run.StartedAt),
		FinishedAt: null.TimeFrom(time.UnixMilli(run.FinishedAt.Int64)),
	}, nil
}

func (r *workflowRunRepo) GetWorkflowNodeRun(
	ctx context.Context,
	workflowNodeRunID int32,
) (*models.WorkflowRunNodeRun, error) {
	row, err := r.q.GetWorkflowNodeRun(ctx, workflowNodeRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow node run: %w", err)
	}

	var metadataJSON null.String
	if row.Metadata != nil {
		if err := json.Unmarshal(row.Metadata, &metadataJSON); err != nil {
			return nil, fmt.Errorf("db error unmarshal workflow node run metadata: %w", err)
		}
	}

	return &models.WorkflowRunNodeRun{
		ID:             row.ID,
		WorkflowRunID:  row.WorkflowRunID,
		WorkflowNodeID: row.WorkflowNodeID,
		Status:         row.Status,
		StartedAt:      time.UnixMilli(row.StartedAt),
		FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
		Metadata:       metadataJSON,
	}, nil
}

func (r *workflowRunRepo) GetWorkflowNodeRuns(
	ctx context.Context,
	workflowRunID int32,
	status *string,
) ([]*models.WorkflowRunNodeRun, error) {
	rows, err := r.q.GetWorkflowNodeRunsByRunID(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow node runs: %w", err)
	}

	workflowRunNodeRuns := make([]*models.WorkflowRunNodeRun, len(rows))

	for i, row := range rows {
		var metadataJSON string
		if err := json.Unmarshal(row.Metadata, &metadataJSON); err != nil {
			return nil, fmt.Errorf("db error unmarshal workflow node run metadata: %w", err)
		}

		if status != nil && *status != row.Status {
			continue
		}

		workflowRunNodeRuns[i] = &models.WorkflowRunNodeRun{
			ID:             row.ID,
			WorkflowRunID:  row.WorkflowRunID,
			WorkflowNodeID: row.WorkflowNodeID,
			Status:         row.Status,
			StartedAt:      time.UnixMilli(row.StartedAt),
			FinishedAt:     null.TimeFrom(time.UnixMilli(row.FinishedAt.Int64)),
			Metadata:       null.StringFrom(string(metadataJSON)),
		}
	}

	return workflowRunNodeRuns, nil
}

func (r *workflowRunRepo) UpdateWorkflowRunStatus(
	ctx context.Context,
	workflowRunID int32,
	status string,
) error {
	return nil
}

func (r *workflowRunRepo) UpdateWorkflowNodeRunStatus(
	ctx context.Context,
	workflowNodeRunID int32,
	status string,
) error {
	return nil
}
