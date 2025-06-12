package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type workflowCalendarRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowCalendarRepository(
	q *dao.Queries,
	db *pgxpool.Pool,
) models.WorkflowCalendarRepository {
	return &workflowCalendarRepo{q, db}
}

func marshalConfig(config models.WorkflowCalendarConfig) ([]byte, error) {
	jsonBytes, err := json.Marshal(config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal workflow calendar config: %w", err)
	}

	return jsonBytes, nil
}

func (r *workflowCalendarRepo) CreateWorkflowCalendar(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowCalendarConfig,
	syncToken string,
	executionState string,
	lastSyncedAt int64,
) (*models.WorkflowCalendar, error) {
	configBytes, err := marshalConfig(config)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()

	result, err := r.q.CreateWorkflowCalendar(ctx, &dao.CreateWorkflowCalendarParams{
		WorkflowID:     workflowID,
		Config:         configBytes,
		SyncToken:      syncToken,
		ExecutionState: executionState,
		LastSyncedAt:   lastSyncedAt,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow calendar: %w", err)
	}

	return &models.WorkflowCalendar{
		ID:             result.ID,
		WorkflowID:     result.WorkflowID,
		Config:         config,
		SyncToken:      result.SyncToken,
		ExecutionState: result.ExecutionState,
		LastSyncedAt:   time.UnixMilli(result.LastSyncedAt).UTC(),
	}, nil
}

func (r *workflowCalendarRepo) GetActiveWorkflowCalendarsLocked(
	ctx context.Context,
) ([]*models.WorkflowCalendar, error) {
	rows, err := r.q.GetActiveWorkflowCalendarsLocked(ctx, 1000)
	if err != nil {
		return nil, fmt.Errorf("failed to get active workflow calendars locked: %w", err)
	}

	var c []*models.WorkflowCalendar

	for _, r := range rows {
		var config models.WorkflowCalendarConfig
		if err := json.Unmarshal(r.Config, &config); err != nil {
			return nil, fmt.Errorf("failed to unmarshal workflow calendar config: %w", err)
		}

		c = append(c, &models.WorkflowCalendar{
			ID:             r.ID,
			UserID:         r.UserID,
			WorkflowID:     r.WorkflowID,
			Config:         config,
			SyncToken:      r.SyncToken,
			ExecutionState: r.ExecutionState,
			LastSyncedAt:   time.UnixMilli(r.LastSyncedAt).UTC(),
		})
	}

	return c, nil
}

func (r *workflowCalendarRepo) UpdateWorkflowCalendar(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowCalendarConfig,
	syncToken string,
	executionState string,
	lastSyncedAt int64,
) error {
	configBytes, err := marshalConfig(config)
	if err != nil {
		return fmt.Errorf("failed to marshal workflow calendar config: %w", err)
	}

	now := time.Now().UnixMilli()

	err = r.q.UpdateWorkflowCalendar(ctx, &dao.UpdateWorkflowCalendarParams{
		SyncToken:      syncToken,
		Config:         configBytes,
		ExecutionState: executionState,
		LastSyncedAt:   lastSyncedAt,
		UpdatedAt:      now,
		WorkflowID:     workflowID,
	})
	if err != nil {
		return fmt.Errorf("failed to update workflow calendar: %w", err)
	}

	return nil
}
