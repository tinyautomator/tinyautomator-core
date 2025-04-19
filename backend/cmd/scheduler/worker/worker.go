package worker

import (
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

type Worker struct {
	service      *Service
	pollInterval time.Duration
	logger       logrus.FieldLogger
}

func NewWorker(cfg config.AppConfig) (*Worker, error) {
	service, err := NewService(cfg.GetScheduleRepository())
	if err != nil {
		return nil, fmt.Errorf("failed to init worker service: %w", err)
	}

	return &Worker{
		service:      service,
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

func (w *Worker) PollAndSchedule() error {
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

			w.logger.WithField("trigger_id", trigger.ID).Info("Trigger scheduled successfully")
		}

		time.Sleep(w.pollInterval)
	}
}
