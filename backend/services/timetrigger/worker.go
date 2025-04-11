package timetrigger

import (
	"fmt"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
)

type Worker struct{
	service *Service
	pollInterval time.Duration

}

func NewWorker(pollingInterval time.Duration) (*Worker , error){
	repo := timetrigger.NewInMemoryRepository()
	service, err := NewService(repo)
	if err != nil{
		return nil, fmt.Errorf("repo cannot be empty")
	}
	return &Worker{
		service: service,
		pollInterval: pollingInterval,
	}, nil
}

func (w *Worker) PollAndRun() error {
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
			
			err = w.validateJobNextRunMatch(trigger, job)
			if err != nil{
				return err
			}

			
			
		}
		

		time.Sleep(w.pollInterval)
	}
}

func (w *Worker) validateJobNextRunMatch(t models.TimeTrigger, j gocron.Job) (error){
	jobNextRun, err := j.NextRun()
	if err != nil{
		return err
	}
	if !t.NextRun.Truncate(time.Minute).Equal(jobNextRun.Truncate(time.Minute)){
		 return fmt.Errorf(
			"trigger NextRun %s and job NextRun do not match %s",
			t.NextRun.Format(time.DateTime),
			jobNextRun.Format(time.DateTime),
		)
		
	}
	return nil
}


