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

type workflowEmailRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewWorkflowEmailRepository(q *dao.Queries, db *pgxpool.Pool) models.WorkflowEmailRepository {
	return &workflowEmailRepo{q, db}
}

func (r *workflowEmailRepo) CreateWorkflowEmail(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowEmailConfig,
	historyID string,
	executionState string,
	lastSyncedAt int64,
) (*models.WorkflowEmail, error) {
	configBytes, err := marshalConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal workflow email config: %w", err)
	}

	now := time.Now().UnixMilli()

	row, err := r.q.CreateWorkflowEmail(ctx, &dao.CreateWorkflowEmailParams{
		WorkflowID:     workflowID,
		Config:         configBytes,
		HistoryID:      historyID,
		ExecutionState: executionState,
		LastSyncedAt:   lastSyncedAt,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow email: %w", err)
	}

	return &models.WorkflowEmail{
		ID:             row.ID,
		WorkflowID:     row.WorkflowID,
		Config:         config,
		HistoryID:      row.HistoryID,
		ExecutionState: row.ExecutionState,
		LastSyncedAt:   time.UnixMilli(row.LastSyncedAt).UTC(),
	}, nil
}

func (r *workflowEmailRepo) UpdateWorkflowEmail(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowEmailConfig,
	historyID string,
	executionState string,
	lastSyncedAt int64,
) error {
	configBytes, err := marshalConfig(config)
	if err != nil {
		return fmt.Errorf("failed to marshal workflow email config: %w", err)
	}

	now := time.Now().UnixMilli()

	err = r.q.UpdateWorkflowEmail(ctx, &dao.UpdateWorkflowEmailParams{
		WorkflowID:     workflowID,
		Config:         configBytes,
		HistoryID:      historyID,
		ExecutionState: executionState,
		LastSyncedAt:   lastSyncedAt,
		UpdatedAt:      now,
	})
	if err != nil {
		return fmt.Errorf("failed to update workflow email: %w", err)
	}

	return nil
}

func (r *workflowEmailRepo) GetActiveWorkflowEmailsLocked(
	ctx context.Context,
) ([]*models.WorkflowEmail, error) {
	rows, err := r.q.GetActiveWorkflowEmailsLocked(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get active workflow emails locked: %w", err)
	}

	var result []*models.WorkflowEmail

	for _, row := range rows {
		var config models.WorkflowEmailConfig
		if err := json.Unmarshal(row.Config, &config); err != nil {
			return nil, fmt.Errorf("failed to unmarshal workflow email config: %w", err)
		}

		result = append(result, &models.WorkflowEmail{
			ID:             row.ID,
			WorkflowID:     row.WorkflowID,
			UserID:         row.UserID,
			Config:         config,
			HistoryID:      row.HistoryID,
			ExecutionState: row.ExecutionState,
			LastSyncedAt:   time.UnixMilli(row.LastSyncedAt).UTC(),
		})
	}

	return result, nil
}
