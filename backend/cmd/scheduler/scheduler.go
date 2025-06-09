package main

import (
	"context"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type Scheduler struct {
	schedulerService models.SchedulerService
	calendarService  models.WorkflowCalendarService
	pollInterval     time.Duration
	logger           logrus.FieldLogger
}

func NewScheduler(cfg models.AppConfig) *Scheduler {
	return &Scheduler{
		schedulerService: cfg.GetSchedulerService(),
		calendarService:  cfg.GetWorkflowCalendarService(),
		pollInterval:     cfg.GetEnvVars().WorkerPollInterval,
		logger:           cfg.GetLogger(),
	}
}

func (s *Scheduler) StopScheduler() {
	s.schedulerService.EnsureInFlightEnqueued()
}

func (s *Scheduler) PollAndRunScheduledWorkflows(ctx context.Context) error {
	schedulerTicker := time.NewTicker(s.pollInterval)
	calendarTicker := time.NewTicker(time.Minute * 15) // TODO: make this configurable

	defer schedulerTicker.Stop()
	defer calendarTicker.Stop()

	s.logger.Info("start polling for scheduled workflows")

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("ctx cancelled - stopping polling loop")
			return context.Canceled
		case <-schedulerTicker.C:
			ws, err := s.schedulerService.GetDueWorkflows(ctx)
			if err != nil {
				return fmt.Errorf("error getting due workflows: %w", err)
			}

			s.logger.WithField("count", len(ws)).Info("fetched workflows due")

			for _, ws := range ws {
				s.logger.WithField("workflow_schedule_id", ws.ID).Info("scheduling workflow")

				if err := s.schedulerService.RunScheduledWorkflow(ctx, ws); err != nil {
					s.logger.WithField("workflow_schedule_id", ws.ID).
						Errorf("failed to schedule workflow: %v", err)
				}

				// TODO: change this log because the state of the ws changes after the executor runs
				s.logger.WithFields(logrus.Fields{
					"schedule_id":    ws.ID,
					"workflow_id":    ws.WorkflowID,
					"schedule_type":  ws.ScheduleType,
					"executionState": ws.ExecutionState,
					"next_run_at":    null.TimeFrom(ws.NextRunAt.Time).Time.Format(time.DateTime),
					"last_run_at":    null.TimeFrom(ws.LastRunAt.Time).Time.Format(time.DateTime),
				}).Info("workflow ran successfully")
			}

		case <-calendarTicker.C:
			s.logger.Info("polling for calendar events")

			calendars, err := s.calendarService.GetActiveCalendars(ctx)
			if err != nil {
				s.logger.WithError(err).Error("failed to get active calendars")
			}

			s.logger.WithField("count", len(calendars)).Info("fetched calendars")

			for _, c := range calendars {
				if err := s.calendarService.CheckEventChanges(ctx, c); err != nil {
					s.logger.WithError(err).
						WithField("workflow_id", c.WorkflowID).
						Error("failed to check event changes")
				} else {
					s.logger.WithField("workflow_id", c.WorkflowID).Info("event changes checked successfully")
				}
			}

			s.logger.Info("finished polling for calendar events")
		}
	}
}
