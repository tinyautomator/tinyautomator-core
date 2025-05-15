package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowRun struct {
	ID         int32
	WorkflowID int32
	Status     string
	StartedAt  int64
	FinishedAt *int64
}

type WorkflowRunNodeRun struct {
	ID             int32
	WorkflowRunID  int32
	WorkflowNodeID int32
	Status         string
	StartedAt      int64
	FinishedAt     *int64
	Metadata       map[string]any
	ErrorMessage   *string
	CreatedAt      int64
}

type WorkflowRunRepository interface {
	CreateWorkflowRun(ctx context.Context, workflowID int32) (*WorkflowRun, error)
	CreateWorkflowNodeRun(
		ctx context.Context,
		workflowRunID int32,
		workflowNodeID int32,
	) (*WorkflowRunNodeRun, error)
	CompleteWorkflowRun(
		ctx context.Context,
		workflowRunID int32,
		status string,
		finishedAt time.Time,
	) error
	ListWorkflowRuns(ctx context.Context, workflowID int32) ([]*WorkflowRun, error)
	GetWorkflowRun(ctx context.Context, workflowRunID int32) (*WorkflowRun, error)
	GetWorkflowNodeRuns(ctx context.Context, workflowRunID int32) ([]*WorkflowRunNodeRun, error)
}

type workflowRunRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowRunRepository(q *dao.Queries, db *pgxpool.Pool) WorkflowRunRepository {
	return &workflowRunRepo{q, db}
}

func (r *workflowRunRepo) CreateWorkflowRun(
	ctx context.Context,
	workflowID int32,
) (*WorkflowRun, error) {
	now := time.Now().Unix()

	run, err := r.q.CreateWorkflowRun(ctx, &dao.CreateWorkflowRunParams{
		WorkflowID: workflowID,
		StartedAt:  now,
		CreatedAt:  now,
	})
	if err != nil {
		return nil, err
	}

	return &WorkflowRun{
		ID:         run.ID,
		WorkflowID: run.WorkflowID,
		Status:     run.Status,
		StartedAt:  run.StartedAt,
	}, nil
}

func (r *workflowRunRepo) CreateWorkflowNodeRun(
	ctx context.Context,
	workflowRunID int32,
	workflowNodeID int32,
) (*WorkflowRunNodeRun, error) {
	now := time.Now().Unix()

	run, err := r.q.CreateWorkflowNodeRun(ctx, &dao.CreateWorkflowNodeRunParams{
		WorkflowRunID:  workflowRunID,
		WorkflowNodeID: workflowNodeID,
		StartedAt:      now,
		Metadata:       nil,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow node run: %w", err)
	}

	metadata := make(map[string]any)

	return &WorkflowRunNodeRun{
		ID:             run.ID,
		WorkflowRunID:  run.WorkflowRunID,
		WorkflowNodeID: run.WorkflowNodeID,
		StartedAt:      run.StartedAt,
		Metadata:       metadata,
		CreatedAt:      run.CreatedAt,
		Status:         run.Status,
	}, nil
}

func (r *workflowRunRepo) CompleteWorkflowRun(
	ctx context.Context,
	workflowRunID int32,
	status string,
	finishedAt time.Time,
) error {
	if err := r.q.CompleteWorkflowRun(ctx, &dao.CompleteWorkflowRunParams{
		ID:         workflowRunID,
		Status:     status,
		FinishedAt: null.IntFrom(finishedAt.Unix()),
	}); err != nil {
		return fmt.Errorf("db error complete workflow run: %w", err)
	}

	return nil
}

func (r *workflowRunRepo) ListWorkflowRuns(
	ctx context.Context,
	workflowID int32,
) ([]*WorkflowRun, error) {
	rows, err := r.q.ListWorkflowRuns(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("db error list workflow runs: %w", err)
	}

	workflowRuns := make([]*WorkflowRun, len(rows))

	for i, row := range rows {
		var finishedAt *int64
		if row.FinishedAt.Valid {
			finishedAt = &row.FinishedAt.Int64
		}

		workflowRuns[i] = &WorkflowRun{
			ID:         row.ID,
			WorkflowID: row.WorkflowID,
			Status:     row.Status,
			StartedAt:  row.StartedAt,
			FinishedAt: finishedAt,
		}
	}

	return workflowRuns, nil
}

func (r *workflowRunRepo) GetWorkflowRun(
	ctx context.Context,
	workflowRunID int32,
) (*WorkflowRun, error) {
	run, err := r.q.GetWorkflowRun(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow run: %w", err)
	}

	var finishedAt *int64
	if run.FinishedAt.Valid {
		finishedAt = &run.FinishedAt.Int64
	}

	return &WorkflowRun{
		ID:         run.ID,
		WorkflowID: run.WorkflowID,
		Status:     run.Status,
		StartedAt:  run.StartedAt,
		FinishedAt: finishedAt,
	}, nil
}

func (r *workflowRunRepo) GetWorkflowNodeRuns(
	ctx context.Context,
	workflowRunID int32,
) ([]*WorkflowRunNodeRun, error) {
	rows, err := r.q.GetWorkflowNodeRunsByRunID(ctx, workflowRunID)
	if err != nil {
		return nil, fmt.Errorf("db error get workflow node runs: %w", err)
	}

	workflowRunNodeRuns := make([]*WorkflowRunNodeRun, len(rows))

	for i, row := range rows {
		var metadata map[string]any
		if err := json.Unmarshal(row.Metadata, &metadata); err != nil {
			return nil, fmt.Errorf("db error unmarshal workflow node run metadata: %w", err)
		}

		workflowRunNodeRuns[i] = &WorkflowRunNodeRun{
			ID:             row.ID,
			WorkflowRunID:  row.WorkflowRunID,
			WorkflowNodeID: row.WorkflowNodeID,
			Status:         row.Status,
			StartedAt:      row.StartedAt,
			FinishedAt:     &row.FinishedAt.Int64,
			Metadata:       metadata,
			ErrorMessage:   &row.ErrorMessage.String,
			CreatedAt:      row.CreatedAt,
		}
	}

	return workflowRunNodeRuns, nil
}
