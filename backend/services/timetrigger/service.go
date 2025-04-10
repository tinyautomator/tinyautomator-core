// TODO: Finish adding base functionality for the time t service

package timetrigger

import (
	"errors"
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
// ValidateTrigger checks that the given TimeTrigger has a valid configuration.
// It ensures the interval, timing, and action fields are consistent and safe to schedule.

func ValidateTrigger(t models.TimeTrigger) error {
	// Check if the interval is valid
	switch t.Interval {
	case "daily":
		if t.DayOfWeek != 0 || t.DayOfMonth != 0 {
			return errors.New("invalid trigger: daily triggers must not set dayOfWeek or dayOfMonth")
		}
	
	case "weekly":
		if t.DayOfWeek < 0 || t.DayOfWeek > 6 {
			return errors.New("invalid trigger: weekly triggers must set dayOfWeek between 0 and 6")
		}
		if t.DayOfMonth != 0 {
			return errors.New("invalid trigger: weekly triggers must not set dayOfMonth")
		}
	
	case "monthly":
		if t.DayOfMonth < 1 || t.DayOfMonth > 31 {
			return errors.New("invalid trigger: monthly triggers must set dayOfMonth between 1 and 31")
		}
		if t.DayOfWeek != 0 {
			return errors.New("invalid trigger: monthly triggers must not set dayOfWeek")
		}
	
	default:
		return errors.New("invalid interval: "+ t.Interval)
	}
	// Check if the trigger time is valid	
	_ , _, err := parseTriggerAt(t.TriggerAt)
	if err != nil {
		return errors.New("invalid trigger: "+ t.TriggerAt + " is not a valid time format")
	}
	
	// Check if the next run time is valid
	if t.NextRun.IsZero() {
		return errors.New("invalid trigger: next run time is not set")
	}
	if t.NextRun.Before(time.Now()) {
		return errors.New("invalid trigger: next run time is in the past")
	}

	// Check if the action is valid
	switch t.Action {
	case "send_email":
		// OK
	default:
		return errors.New("unsupported action: " + t.Action)
	}


	return nil
}
		



func (s *Service) ScheduleTrigger(t models.TimeTrigger) (gocron.Job , error) {
		err := ValidateTrigger(t)
		if err != nil {
			log.Printf("Error validating trigger ID %d: %v", t.ID, err)
			return nil, err
		}

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
		t.NextRun, err = calculateNextRun(t)
		if err != nil {
			log.Printf("Error calculating next run for trigger ID %d: %v", t.ID, err)
			return nil, err
		}
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

