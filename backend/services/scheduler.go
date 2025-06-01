package services

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/golang-module/carbon/v2"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type SchedulerService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowScheduleRepo models.WorkflowScheduleRepository
	workflowRepo         models.WorkflowRepository
	orchestrator         models.OrchestratorService
}

func NewSchedulerService(cfg models.AppConfig) models.SchedulerService {
	return &SchedulerService{
		logger:               cfg.GetLogger(),
		workflowScheduleRepo: cfg.GetWorkflowScheduleRepository(),
		workflowRepo:         cfg.GetWorkflowRepository(),
		orchestrator:         cfg.GetOrchestratorService(),
	}
}

func (s *SchedulerService) EnsureInFlightEnqueued() {
	s.logger.Info("waiting for in-flight workflow nodes to finish enqueuing...")
	s.wg.Wait()
	s.logger.Info("workflow nodes in flight enqueued successfully")
}

func (s *SchedulerService) GetDueWorkflows(
	ctx context.Context,
) ([]*models.WorkflowSchedule, error) {
	ws, err := s.workflowScheduleRepo.GetDueSchedulesLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get due schedules: %w", err)
	}

	return ws, nil
}

func (s *SchedulerService) RunScheduledWorkflow(
	ctx context.Context,
	ws *models.WorkflowSchedule,
) error {
	if ctx.Err() != nil {
		s.logger.WithField("workflow_id", ws.WorkflowID).Warn("ctx cancelled, skipping schedule")
		return nil
	}

	err := s.ValidateSchedule(ws.ScheduleType, ws.NextRunAt.Time)
	if err != nil {
		return fmt.Errorf("failed to validate schedule: %w", err)
	}

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()

		if runID, err := s.orchestrator.OrchestrateWorkflow(ctx, ws.WorkflowID); err != nil ||
			runID == -1 {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"schedule_id": ws.ID,
				"workflow_id": ws.WorkflowID,
			}).Warn("workflow execution failed")
		} else {
			s.logger.WithFields(logrus.Fields{
				"schedule_id": ws.ID,
				"workflow_id": ws.WorkflowID,
				"run_id":      runID,
			}).Info("workflow execution started")
		}

		now := time.Now()
		nextRun := s.CalculateNextRun(ws.ScheduleType, now)

		nr := nextRun.UnixMilli()
		if err := s.workflowScheduleRepo.UpdateNextRun(context.WithoutCancel(ctx), ws.ID, &nr, now.UnixMilli()); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to update next_run_at")
		}
	}()

	return nil
}

func (s *SchedulerService) ValidateSchedule(st string, nextRunAt time.Time) error {
	_, ok := models.ScheduleTypes[st]
	if !ok {
		return fmt.Errorf("invalid schedule type: %s", st)
	}

	dt := carbon.Parse(nextRunAt.Format(time.RFC3339)).SetTimezone("UTC")

	if dt.IsInvalid() {
		return fmt.Errorf("invalid date: %s", dt.ToDateTimeString())
	}

	if !dt.IsFuture() {
		return fmt.Errorf("next_run_at must be in the future: %s", dt.ToDateTimeString())
	}

	logrus.WithFields(logrus.Fields{
		"next_run_at": dt.ToDateTimeString(),
		"est_time":    dt.SetTimezone("America/New_York").ToDateTimeString(),
	}).Info("time of next run")

	return nil
}

func (s *SchedulerService) ScheduleWorkflow(
	ctx context.Context,
	workflowID int32,
) error {
	// TODO: implement
	return nil
}

// TODO: change this to be part of the UpdateNextRun service logic
func (s *SchedulerService) CalculateNextRun(scheduleType string, now time.Time) time.Time {
	var t time.Time

	switch scheduleType {
	case "daily":
		t = now.Add(24 * time.Hour)
		return t
	case "weekly":
		t = now.Add(7 * 24 * time.Hour)
		return t
	case "monthly":
		t = now.Add(30 * 24 * time.Hour)
		return t
	default: // once or invalid
		return now
	}
}

var _ models.SchedulerService = (*SchedulerService)(nil)
