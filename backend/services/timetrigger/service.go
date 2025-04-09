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

func NewService(r timetrigger.Repository) *Service {
	return &Service{
		repo: r,
		scheduler: newScheduler(),
	}
}

func (s *Service) ScheduleTrigger(t models.TimeTrigger) (gocron.Job , error) {

		jobCfg, err := jobbuilder.BuildJobConfig(t)
		if err != nil {
			log.Printf("Error building job config for trigger ID %d: %v", t.ID, err)
			return nil, err
		}

		job , err := s.scheduler.NewJob(jobCfg.Definition, jobCfg.Task, jobCfg.Options...)
		if err != nil {
			log.Printf("Error creating job for trigger ID %d: %v", t.ID, err)
			return nil, err
		}
		t.NextRun = calculateNextRun(t)
		_ = s.repo.UpdateTrigger(t)
		
		return job, nil
	}

func newScheduler() gocron.Scheduler {
		testLogger := gocron.NewLogger(gocron.LogLevelError)
		s, err := gocron.NewScheduler(gocron.WithLocation(time.UTC), gocron.WithLogger(testLogger))
	
		if err != nil {
			log.Fatalf("failed to create scheduler: %v", err)
		}
		s.Start()
		return s
}

func calculateNextRun(t models.TimeTrigger) time.Time {
	now := time.Now().UTC()
	switch t.Interval {
	case "daily":
		return now.Add(24 * time.Hour)
	case "weekly":
		return now.Add(7 * 24 * time.Hour)
	case "monthly":
		return now.AddDate(0, 1, 0)
	case "once":
		return t.NextRun
	default:
		return now
	}
}