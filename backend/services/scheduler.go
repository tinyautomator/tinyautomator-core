package services

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type SchedulerService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowScheduleRepo repositories.WorkflowScheduleRepository
	orchestrator         *OrchestratorService
}

func NewSchedulerService(cfg config.AppConfig) *SchedulerService {
	return &SchedulerService{
		logger:               cfg.GetLogger(),
		workflowScheduleRepo: cfg.GetWorkflowScheduleRepository(),
		orchestrator:         NewOrchestratorService(cfg),
	}
}

func (s *SchedulerService) EnsureInFlightEnqueued() {
	s.logger.Info("waiting for in-flight workflow nodes to finish enqueuing...")
	s.wg.Wait()
	s.logger.Info("workflow nodes in flight enqueued successfully")
}

func (s *SchedulerService) GetDueWorkflows(
	ctx context.Context,
) ([]*dao.WorkflowSchedule, error) {
	ws, err := s.workflowScheduleRepo.GetDueSchedulesLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules from repo: %w", err)
	}

	return ws, nil
}

func (s *SchedulerService) RunScheduledWorkflow(
	ctx context.Context,
	ws *dao.WorkflowSchedule,
) error {
	if ctx.Err() != nil {
		s.logger.WithField("workflow_id", ws.WorkflowID).Warn("ctx cancelled, skipping schedule")
		return nil
	}

	err := s.ValidateSchedule(ws)
	if err != nil {
		return fmt.Errorf("failed to validate schedule: %w", err)
	}

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()

		if err := s.orchestrator.OrchestrateWorkflow(ctx, ws.WorkflowID); err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"schedule_id": ws.ID,
				"workflow_id": ws.WorkflowID,
			}).Warn("workflow execution failed")
		}

		s.logger.WithFields(logrus.Fields{
			"schedule_id": ws.ID,
			"workflow_id": ws.WorkflowID,
		}).Info("workflow execution finished")

		now := time.Now().UnixMilli()
		nextRun := s.CalculateNextRun(ws.ScheduleType, now)

		if err := s.workflowScheduleRepo.UpdateNextRun(context.WithoutCancel(ctx), ws.ID, nextRun, now); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to update next_run_at")
		}
	}()

	return nil
}

func (s *SchedulerService) ValidateSchedule(ws *dao.WorkflowSchedule) error {
	switch ws.ScheduleType {
	case "once", "daily", "weekly", "monthly":
		// TODO: instrument
	default:
		return fmt.Errorf("invalid schedule_type: %s", ws.ScheduleType)
	}

	if !ws.NextRunAt.Valid || ws.NextRunAt.Int64 <= 0 {
		return errors.New("next_run_at must be a valid positive timestamp")
	}

	return nil
}

// TODO: change this to be part of the UpdateNextRun service logic
func (s *SchedulerService) CalculateNextRun(scheduleType string, now int64) *int64 {
	var t int64

	switch scheduleType {
	case "daily":
		t = now + int64(24*time.Hour/time.Millisecond)
		return &t
	case "weekly":
		t = now + int64(7*24*time.Hour/time.Millisecond)
		return &t
	case "monthly":
		t = now + int64(30*24*time.Hour/time.Millisecond)
		return &t
	default: // once or invalid
		return nil
	}
}
