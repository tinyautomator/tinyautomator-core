package repositories

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type inMemoryRepository struct {
	schedules map[string]*dao.WorkflowSchedule
}

func NewInMemoryRepository() WorkflowScheduleRepository {
	return &inMemoryRepository{
		schedules: make(map[string]*dao.WorkflowSchedule),
	}
}

func (r *inMemoryRepository) GetWorkflowSchedules(
	ctx context.Context, within time.Duration,
) ([]*dao.WorkflowSchedule, error) {
	now := time.Now().UTC()
	cutoff := now.Add(within)

	results := make([]*dao.WorkflowSchedule, 0, len(r.schedules))

	for _, s := range r.schedules {
		nextRun := time.UnixMilli(s.NextRunAt.Int64)
		if nextRun.Before(cutoff) {
			results = append(results, s)
		}
	}

	return results, nil
}

func (r *inMemoryRepository) UpdateNextRun(
	ctx context.Context,
	id string,
	nextRunAt *int64,
	lastRunAt int64,
) error {
	status := "active"

	var nextRunAtNullable sql.NullInt64

	if nextRunAt != nil {
		nextRunAtNullable = sql.NullInt64{
			Int64: *nextRunAt,
			Valid: true,
		}
	} else {
		status = "completed"
		nextRunAtNullable = sql.NullInt64{
			Valid: false,
		}
	}

	if _, exists := r.schedules[id]; !exists {
		return errors.New("update: schedule not found")
	}

	r.schedules[id].Status = status
	r.schedules[id].NextRunAt = nextRunAtNullable
	r.schedules[id].LastRunAt = sql.NullInt64{Int64: lastRunAt}
	r.schedules[id].UpdatedAt = time.Now().UTC().UnixMilli()

	return nil
}

func (r *inMemoryRepository) Create(
	ctx context.Context,
	arg *dao.CreateWorkflowScheduleParams,
) (*dao.WorkflowSchedule, error) {
	arg.ID = uuid.New().String()
	arg.CreatedAt = time.Now().UTC().UnixMilli()
	arg.UpdatedAt = time.Now().UTC().UnixMilli()

	ws := &dao.WorkflowSchedule{
		WorkflowID:   arg.WorkflowID,
		ScheduleType: arg.ScheduleType,
		Status:       arg.Status,
		NextRunAt:    arg.NextRunAt,
		LastRunAt:    arg.LastRunAt,
	}
	r.schedules[ws.ID] = ws

	return ws, nil
}

func (r *inMemoryRepository) Delete(ctx context.Context, id string) error {
	delete(r.schedules, id)

	return nil
}

var _ WorkflowScheduleRepository = (*inMemoryRepository)(nil)
