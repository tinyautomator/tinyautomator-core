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

	st, ok := models.ScheduleTypes[ws.ScheduleType]
	if !ok {
		return fmt.Errorf("invalid schedule type: %s", ws.ScheduleType)
	}

	err := s.ValidateSchedule(st, ws.NextRunAt.Time, ws.ExecutionState == "running")
	if err != nil {
		return fmt.Errorf("failed to validate schedule: %w", err)
	}

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()

		if runID, err := s.orchestrator.OrchestrateWorkflow(ctx, ws.UserID, ws.WorkflowID); err != nil ||
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

		now := time.Now().UTC()
		oldNextRun := ws.NextRunAt.Time

		nextRun, err := s.CalculateNextRun(st, oldNextRun, now)
		if err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to calculate next run")
		}

		var nr *int64

		if nextRun != nil {
			_nr := nextRun.UnixMilli()
			nr = &_nr
		}

		lastRun := now.UnixMilli()
		if err := s.workflowScheduleRepo.UpdateWorkflowSchedule(context.WithoutCancel(ctx), ws.WorkflowID, string(st), nr, &lastRun); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to update next_run_at")
		}
	}()

	return nil
}

func (s *SchedulerService) ValidateSchedule(
	st models.ScheduleType,
	nextRunAt time.Time,
	isRunning bool,
) error {
	dt := carbon.Parse(nextRunAt.Format(time.RFC3339)).SetTimezone("UTC")

	if dt.IsInvalid() {
		return fmt.Errorf("invalid date: %s", dt.ToDateTimeString())
	}

	if !dt.IsFuture() && !isRunning {
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
	scheduleType models.ScheduleType,
	scheduledDate time.Time,
) error {
	s.logger.WithFields(logrus.Fields{
		"workflow_id":    workflowID,
		"schedule_type":  scheduleType,
		"scheduled_date": scheduledDate,
	}).Info("scheduling workflow")

	_, err := s.workflowScheduleRepo.Create(
		ctx,
		workflowID,
		string(scheduleType),
		scheduledDate.UnixMilli(),
		"queued",
	)
	if err != nil {
		return fmt.Errorf("failed to create workflow schedule: %w", err)
	}

	return nil
}

func (s *SchedulerService) UpdateWorkflowSchedule(
	ctx context.Context,
	workflowID int32,
	scheduleType models.ScheduleType,
	scheduledDate time.Time,
) error {
	scheduledDateUnix := scheduledDate.UnixMilli()
	if err := s.workflowScheduleRepo.UpdateWorkflowSchedule(ctx, workflowID, string(scheduleType), &scheduledDateUnix, nil); err != nil {
		return fmt.Errorf("failed to update workflow schedule: %w", err)
	}

	return nil
}

func (s *SchedulerService) CalculateNextRun(
	st models.ScheduleType,
	oldNextRun time.Time,
	now time.Time,
) (*time.Time, error) {
	if st == models.ScheduleTypeOnce {
		return nil, nil
	}

	basis := oldNextRun
	if basis.IsZero() {
		basis = now
	}

	dt := carbon.Parse(basis.Format(time.RFC3339)).SetTimezone("UTC")

	for !dt.IsFuture() {
		switch st {
		case models.ScheduleTypeDaily:
			dt = dt.AddDay()
		case models.ScheduleTypeWeekly:
			dt = dt.AddWeek()
		case models.ScheduleTypeMonthly:
			dt = dt.AddMonth()
		default:
			return nil, fmt.Errorf("invalid schedule type: %s", st)
		}
	}

	t := dt.StdTime()

	return &t, nil
}

var _ models.SchedulerService = (*SchedulerService)(nil)
