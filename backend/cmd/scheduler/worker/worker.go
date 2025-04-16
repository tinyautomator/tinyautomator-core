package worker

import (
	"fmt"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
)

type Worker struct {
	service      *Service
	pollInterval time.Duration
}

func NewWorker(pollingInterval time.Duration, repo timetrigger.Repository) (*Worker, error) {
	service, err := NewService(repo)

	if err != nil {
		return nil, fmt.Errorf("repo cannot be empty")
	}
	return &Worker{
		service:      service,
		pollInterval: pollingInterval,
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
