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
		pollInterval: cfg.GetEnvVars().WorkerPollIntervalMinutes,
		logger:       cfg.GetLogger(),
	}
}

func (w *Worker) StartScheduler() {
	w.service.Start()
}

func (w *Worker) StopScheduler() {
	w.service.Shutdown()
}

func (w *Worker) PollAndSchedule(ctx context.Context) error {
	for {
		ws, err := w.service.GetWorkflowsToSchedule(ctx, w.pollInterval)
		if err != nil {
			return fmt.Errorf("error getting due triggers: %w", err)
		}

		for _, ws := range ws {
			if err := w.service.ScheduleWorkflow(ws); err != nil {
				w.logger.WithField("workflow_schedule_id", ws.ID).
					Errorf("failed to schedule workflow: %v", err)
			}

			w.logger.WithFields(logrus.Fields{
				"schedule_id":   ws.ID,
				"workflow_id":   ws.WorkflowID,
				"schedule_type": ws.ScheduleType,
				"status":        ws.Status,
				"next_run_at":   ws.NextRunAt.Int64,
				"last_run_at":   ws.LastRunAt.Int64,
			}).Info("workflow scheduled successfully")
		}

		time.Sleep(w.pollInterval)
	}
}
