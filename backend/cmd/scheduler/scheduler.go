package main

import (
	"context"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type Scheduler struct {
	service      models.SchedulerService
	pollInterval time.Duration
	logger       logrus.FieldLogger
}

func NewScheduler(cfg models.AppConfig) *Scheduler {
	return &Scheduler{
		service:      services.NewSchedulerService(cfg),
		pollInterval: cfg.GetEnvVars().WorkerPollInterval,
		logger:       cfg.GetLogger(),
	}
}

func (s *Scheduler) StopScheduler() {
	s.service.EnsureInFlightEnqueued()
}

func (s *Scheduler) PollAndRunScheduledWorkflows(ctx context.Context) error {
	ticker := time.NewTicker(s.pollInterval)
	defer ticker.Stop()

	s.logger.Info("start polling for scheduled workflows")

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("ctx cancelled - stopping polling loop")
			return context.Canceled
		case <-ticker.C:
			ws, err := s.service.GetDueWorkflows(ctx)
			if err != nil {
				return fmt.Errorf("error getting due workflows: %w", err)
			}

			s.logger.WithField("count", len(ws)).Info("fetched workflows due")

			for _, ws := range ws {
				s.logger.WithField("workflow_schedule_id", ws.ID).Info("scheduling workflow")

				if err := s.service.RunScheduledWorkflow(ctx, ws); err != nil {
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
		}
	}
}
