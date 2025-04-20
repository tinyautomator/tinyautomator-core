package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowScheduleRepository interface {
	GetWorkflowSchedules(ctx context.Context, within time.Duration) ([]*dao.WorkflowSchedule, error)
	UpdateNextRun(ctx context.Context, id string, nextRun int64, lastRun int64) error
	Create(
		ctx context.Context,
		arg *dao.CreateWorkflowScheduleParams,
	) (*dao.WorkflowSchedule, error)
	Delete(ctx context.Context, id string) error
}

type workflowScheduleRepo struct {
	q *dao.Queries
}

func NewWorkflowScheduleRepository(q *dao.Queries) WorkflowScheduleRepository {
	return &workflowScheduleRepo{q}
}

func (r *workflowScheduleRepo) GetWorkflowSchedules(
	ctx context.Context,
	within time.Duration,
) ([]*dao.WorkflowSchedule, error) {
	now := time.Now().UTC()
	cutoff := now.Add(within).UnixMilli()

	s, err := r.q.GetDueWorkflowSchedules(ctx, sql.NullInt64{Int64: cutoff})
	if err != nil {
		return nil, fmt.Errorf("db error get workflow schedules: %w", err)
	}

	return s, nil
}

func (r *workflowScheduleRepo) UpdateNextRun(
	ctx context.Context,
	id string,
	nextRunAt int64,
	lastRunAt int64,
) error {
	if err := r.q.UpdateScheduleTimes(ctx, &dao.UpdateScheduleTimesParams{
		ID:        id,
		NextRunAt: sql.NullInt64{Int64: nextRunAt},
		LastRunAt: sql.NullInt64{Int64: lastRunAt},
		UpdatedAt: time.Now().UTC().UnixMilli(),
	}); err != nil {
		return fmt.Errorf("db error update workflow schedule: %w", err)
	}

	return nil
}

func (r *workflowScheduleRepo) Create(
	ctx context.Context,
	arg *dao.CreateWorkflowScheduleParams,
) (*dao.WorkflowSchedule, error) {
	arg.ID = uuid.New().String()
	arg.CreatedAt = time.Now().UTC().UnixMilli()
	arg.UpdatedAt = time.Now().UTC().UnixMilli()

	s, err := r.q.CreateWorkflowSchedule(ctx, arg)
	if err != nil {
		return nil, fmt.Errorf("db error create workflow schedule: %w", err)
	}

	return s, nil
}

func (r *workflowScheduleRepo) Delete(ctx context.Context, id string) error {
	if err := r.q.DeleteWorkflowSchedule(ctx, id); err != nil {
		return fmt.Errorf("db error delete workflow schedule: %w", err)
	}

	return nil
}
