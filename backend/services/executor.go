package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type ExecutorService struct {
	workflowRepo    models.WorkflowRepository
	workflowRunRepo models.WorkflowRunRepository
	logger          logrus.FieldLogger
}

func NewExecutorService(cfg models.AppConfig) models.ExecutorService {
	return &ExecutorService{
		workflowRepo:    cfg.GetWorkflowRepository(),
		workflowRunRepo: cfg.GetWorkflowRunRepository(),
		logger:          cfg.GetLogger(),
	}
}

func (s *ExecutorService) ExecuteWorkflowNode(ctx context.Context, msg []byte) error {
	var task models.WorkflowNodeTask
	if err := json.Unmarshal(msg, &task); err != nil {
		return fmt.Errorf("failed to unmarshal task: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id": task.WorkflowID,
		"run_id":      task.RunID,
		"node_id":     task.NodeID,
		"node_run_id": task.NodeRunID,
	}).Info("executing workflow node")

	// TODO: Implement actual task processing logic
	// This will be implemented in the next step

	return nil
}

var _ models.ExecutorService = (*ExecutorService)(nil)
