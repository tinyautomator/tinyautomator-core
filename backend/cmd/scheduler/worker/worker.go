package worker

import (
	"fmt"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

type Worker struct {
	service      *Service
	pollInterval time.Duration
}

func NewWorker(cfg config.AppConfig) (*Worker, error) {
	service, err := NewService(cfg.GetScheduleRepository())
	if err != nil {
		return nil, fmt.Errorf("repo cannot be empty")
	}

	return &Worker{
		service:      service,
		pollInterval: cfg.GetEnvVars().WorkerPollIntervalMinutes,
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
		triggersDueSoon, err := w.service.repo.FetchTriggersScheduledWithinDuration(w.pollInterval)
		if err != nil {
			return fmt.Errorf("error getting due triggers: %v", err)
		}

		for _, trigger := range triggersDueSoon {
			job, err := w.service.ScheduleTrigger(trigger)
			if err != nil {
				fmt.Printf("❌ Error executing trigger ID %d: %v\n", trigger.ID, err)
			}

			_ = job
		}

		time.Sleep(w.pollInterval)
	}
}
