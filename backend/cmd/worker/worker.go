package main

import (
	"context"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

type Worker struct {
	service      *WorkerService
	pollInterval time.Duration
	logger       logrus.FieldLogger
}

func NewWorker(cfg config.AppConfig) *Worker {
	return &Worker{
		service:      NewWorkerService(cfg),
		pollInterval: cfg.GetEnvVars().WorkerPollInterval,
		logger:       cfg.GetLogger(),
	}
}

func (w *Worker) StopScheduler() {
	w.service.Shutdown()
}

func (w *Worker) PollAndSchedule(ctx context.Context) error {
	ticker := time.NewTicker(w.pollInterval)
	defer ticker.Stop()

	w.logger.Info("start polling for scheduled workflows")

	for {
		select {
		case <-ctx.Done():
			w.logger.Info("ctx cancelled - stopping polling loop")
			return nil
		case <-ticker.C:
			ws, err := w.service.GetDueWorkflows(ctx)
			if err != nil {
				return fmt.Errorf("error getting due workflows: %w", err)
			}

			w.logger.WithField("count", len(ws)).Info("fetched workflows due")

			for _, ws := range ws {
				w.logger.WithField("workflow_schedule_id", ws.ID).Info("scheduling workflow")

				if err := w.service.RunWorkflow(ctx, ws); err != nil {
					w.logger.WithField("workflow_schedule_id", ws.ID).
						Errorf("failed to schedule workflow: %v", err)
				}

				// TODO: change this log because the state of the ws changes after the executor runs
				w.logger.WithFields(logrus.Fields{
					"schedule_id":   ws.ID,
					"workflow_id":   ws.WorkflowID,
					"schedule_type": ws.ScheduleType,
					"status":        ws.Status,
					"next_run_at":   time.UnixMilli(ws.NextRunAt.Int64).Format(time.DateTime),
					"last_run_at":   time.UnixMilli(ws.LastRunAt.Int64).Format(time.DateTime),
				}).Info("workflow ran successfully")
			}
		}
	}
}
