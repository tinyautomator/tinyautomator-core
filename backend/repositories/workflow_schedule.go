package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowScheduleRepository interface {
	GetDueSchedulesLocked(ctx context.Context) ([]*dao.WorkflowSchedule, error)
	UpdateNextRun(
		ctx context.Context,
		id int32,
		nextRunAt *int64,
		lastRunAt int64,
	) error
	Create(
		ctx context.Context,
		workflowID int32,
		next_run int64,
		schedule_type string,
	) (*dao.WorkflowSchedule, error)
	Delete(ctx context.Context, id int32) error
}

type workflowScheduleRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowScheduleRepository(q *dao.Queries, pool *pgxpool.Pool) WorkflowScheduleRepository {
	return &workflowScheduleRepo{q, pool}
}

func (r *workflowScheduleRepo) GetDueSchedulesLocked(
	ctx context.Context,
) ([]*dao.WorkflowSchedule, error) {
	rows, err := r.q.GetDueSchedulesLocked(ctx, 1000)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules: %w", err)
	}

	var s []*dao.WorkflowSchedule

	for _, r := range rows {
		s = append(s, &dao.WorkflowSchedule{
			ID:             r.ID,
			WorkflowID:     r.WorkflowID,
			ScheduleType:   r.ScheduleType,
			ExecutionState: r.ExecutionState,
			NextRunAt:      r.NextRunAt,
			LastRunAt:      r.LastRunAt,
			CreatedAt:      r.CreatedAt,
			UpdatedAt:      r.UpdatedAt,
		})
	}

	return s, nil
}

func (r *workflowScheduleRepo) UpdateNextRun(
	ctx context.Context,
	id int32,
	nextRunAt *int64,
	lastRunAt int64,
) error {
	executionState := "queued"

	// TODO : POTENTIAL REFACTOR
	if nextRunAt == nil {
		executionState = "paused"
	}

	if err := r.q.UpdateWorkflowSchedule(ctx, &dao.UpdateWorkflowScheduleParams{
		ID:             id,
		NextRunAt:      null.IntFromPtr(nextRunAt),
		LastRunAt:      null.IntFrom(lastRunAt),
		UpdatedAt:      time.Now().UTC().UnixMilli(),
		ExecutionState: executionState,
	}); err != nil {
		return fmt.Errorf("db error update workflow schedule: %w", err)
	}

	return nil
}

func (r *workflowScheduleRepo) Create(
	ctx context.Context,
	workflowID int32,
	next_run int64,
	schedule_type string,
) (*dao.WorkflowSchedule, error) {
	now := time.Now().UTC().UnixMilli()

	s, err := r.q.CreateWorkflowSchedule(ctx, &dao.CreateWorkflowScheduleParams{
		WorkflowID:     workflowID,
		ExecutionState: "queued",
		NextRunAt:      null.IntFrom(next_run),
		ScheduleType:   schedule_type,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow schedule: %w", err)
	}

	return s, nil
}

func (r *workflowScheduleRepo) Delete(ctx context.Context, id int32) error {
	if err := r.q.DeleteWorkflowSchedule(ctx, id); err != nil {
		return fmt.Errorf("db error delete workflow schedule: %w", err)
	}

	return nil
}
