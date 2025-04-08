// TODO: Finish adding base functionality for the time t service

package timetrigger

import (
	"log"

	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger/jobbuilder"
)

type Service struct {
	repo timetrigger.Repository
	scheduler gocron.Scheduler
}

func NewScheduler() gocron.Scheduler {
	s, err := gocron.NewScheduler(gocron.WithLocation(time.UTC))
	if err != nil {
		log.Fatalf("failed to create scheduler: %v", err)
	}
	return s
}

func NewService(repo timetrigger.Repository) *Service {
	return &Service{
		repo: repo,
		scheduler: NewScheduler(),
	}
}

func (s *Service) ScheduleTrigger(t models.TimeTrigger) error {

		jobCfg, err := jobbuilder.BuildJobConfig(t)
		if err != nil {
			log.Printf("Error building job config for trigger ID %d: %v", t.ID, err)
			return err
		}

		job, err := s.scheduler.NewJob(jobCfg.Definition, jobCfg.Task, jobCfg.Options...)
		if err != nil {
			log.Printf("Error creating job for trigger ID %d: %v", t.ID, err)
			return err
		}
		log.Printf("Scheduled job for trigger ID %d with tags: %v", t.ID, job.Tags())
		return nil
	}
