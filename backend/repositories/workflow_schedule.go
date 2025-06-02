package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type workflowScheduleRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowScheduleRepository(
	q *dao.Queries,
	pool *pgxpool.Pool,
) models.WorkflowScheduleRepository {
	return &workflowScheduleRepo{q, pool}
}

func (r *workflowScheduleRepo) GetDueSchedulesLocked(
	ctx context.Context,
) ([]*models.WorkflowSchedule, error) {
	rows, err := r.q.GetDueSchedulesLocked(ctx, 1000)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules: %w", err)
	}

	var s []*models.WorkflowSchedule

	for _, r := range rows {
		s = append(s, &models.WorkflowSchedule{
			ID:             r.ID,
			UserID:         r.UserID,
			WorkflowID:     r.WorkflowID,
			ScheduleType:   r.ScheduleType,
			ExecutionState: r.ExecutionState,
			NextRunAt:      null.TimeFrom(time.UnixMilli(r.NextRunAt.Int64)),
			LastRunAt:      null.TimeFrom(time.UnixMilli(r.LastRunAt.Int64)),
			CreatedAt:      time.UnixMilli(r.CreatedAt),
			UpdatedAt:      time.UnixMilli(r.UpdatedAt),
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
	executionState string,
	next_run int64,
	schedule_type string,
) (*models.WorkflowSchedule, error) {
	now := time.Now().UTC().UnixMilli()

	s, err := r.q.CreateWorkflowSchedule(ctx, &dao.CreateWorkflowScheduleParams{
		WorkflowID:     workflowID,
		ExecutionState: executionState,
		NextRunAt:      null.IntFrom(next_run),
		ScheduleType:   schedule_type,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		return nil, fmt.Errorf("db error create workflow schedule: %w", err)
	}

	return &models.WorkflowSchedule{
		ID:             s.ID,
		WorkflowID:     s.WorkflowID,
		ScheduleType:   s.ScheduleType,
		ExecutionState: s.ExecutionState,
		NextRunAt:      null.TimeFrom(time.UnixMilli(s.NextRunAt.Int64)),
		LastRunAt:      null.TimeFrom(time.UnixMilli(s.LastRunAt.Int64)),
		CreatedAt:      time.UnixMilli(s.CreatedAt),
		UpdatedAt:      time.UnixMilli(s.UpdatedAt),
	}, nil
}

func (r *workflowScheduleRepo) Delete(ctx context.Context, id int32) error {
	if err := r.q.DeleteWorkflowSchedule(ctx, id); err != nil {
		return fmt.Errorf("db error delete workflow schedule: %w", err)
	}

	return nil
}

func (r *workflowScheduleRepo) DeleteWorkflowScheduleByWorkflowID(
	ctx context.Context,
	workflowID int32,
) error {
	if err := r.q.DeleteWorkflowScheduleByWorkflowID(ctx, workflowID); err != nil {
		return fmt.Errorf("db error delete workflow schedule by workflow id: %w", err)
	}

	return nil
}

var _ models.WorkflowScheduleRepository = (*workflowScheduleRepo)(nil)
