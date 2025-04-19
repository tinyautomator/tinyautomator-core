package worker

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

func NewWorker(cfg config.AppConfig) (*Worker, error) {
	s, err := NewWorkerService(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to init worker service: %w", err)
	}

	return &Worker{
		service:      s,
		pollInterval: cfg.GetEnvVars().WorkerPollIntervalMinutes,
		logger:       cfg.GetLogger(),
	}, nil
}

func (w *Worker) StartScheduler() {
	w.service.Start()
}

func (w *Worker) StopScheduler() {
	w.service.Shutdown()
}

func (w *Worker) PollAndSchedule(ctx context.Context) error {
	for {
		triggersDueSoon, err := w.service.GetDueTriggers(w.pollInterval)
		if err != nil {
			return fmt.Errorf("error getting due triggers: %w", err)
		}

		for _, trigger := range triggersDueSoon {
			job, err := w.service.ScheduleTrigger(trigger)
			if err != nil {
				w.logger.WithField("trigger_id", trigger.ID).
					Errorf("failed to schedule trigger: %v", err)
			}

			// TODO: wire executor logic and update the log to have job specific fields for monitoring
			_ = job

			w.logger.WithField("trigger_id", trigger.ID).Info("trigger scheduled successfully")
		}

		time.Sleep(w.pollInterval)
	}
}
