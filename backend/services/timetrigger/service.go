package timetrigger

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger/jobbuilder"
)

// Service manages the scheduling and execution of time-based triggers.
// It coordinates between the repository, job builder, and scheduler.
type Service struct {
	repo timetrigger.Repository
	scheduler gocron.Scheduler

	taskOverride func(models.TimeTrigger) gocron.Task 
	onTriggerComplete func(models.TimeTrigger)
}

// Return error here
func newScheduler() gocron.Scheduler {
	logger := gocron.NewLogger(gocron.LogLevelDebug)
	s, err := gocron.NewScheduler(gocron.WithLocation(time.UTC), gocron.WithLogger(logger))

	if err != nil {
		log.Fatalf("failed to create scheduler: %v", err)
	}
	return s
}

func NewService(r timetrigger.Repository) (*Service, error) {
    if r == nil {
        return nil, errors.New("repository cannot be nil")
    }
    
    s := newScheduler()
    return &Service{
        repo: r,
        scheduler: s,
    }, nil
}

func (s *Service) Start(){
	s.scheduler.Start()
}

func (s *Service) Shutdown(){
	s.scheduler.Shutdown()
}
// ValidateTrigger checks that the given TimeTrigger has a valid configuration.
// It ensures the interval, timing, and action fields are consistent and safe to schedule.
func (s *Service) ValidateTrigger(t models.TimeTrigger) error {
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

	// Check if the action is valid
	switch t.Action {
	case "send_email":
		// OK
	default:
		return errors.New("unsupported action: " + t.Action)
	}


	return nil
}

// ScheduleTrigger validates and schedules a new trigger for execution.
// Returns the scheduled job or an error if validation or scheduling fails.
func (s *Service) ScheduleTrigger(t models.TimeTrigger) (gocron.Job , error) {
		err := s.ValidateTrigger(t)
		if err != nil {
			log.Printf("Error validating trigger ID %d: %v", t.ID, err)
			return nil, err
		}
		taskFactory := s.CreateTaskFactory()

		jobCfg, err := jobbuilder.BuildJobConfig(t, taskFactory)
		if err != nil {
			log.Printf("Error building job config for trigger ID %d: %v", t.ID, err)
			return nil, err
		}
		jobCfg.Options = append(jobCfg.Options, s.jobEventOptions(t))

		job , err := s.scheduler.NewJob(jobCfg.Definition, jobCfg.Task, jobCfg.Options...)
		if err != nil {
			log.Printf("Error creating job for trigger ID %d: %v", t.ID, err)
			return nil, err
		}
		err = s.validateJobNextRunMatch(t, job)
		if err != nil{
			log.Printf("⚠️ NextRun mismatch for trigger ID %d: %v", t.ID, err)
			return nil, err
		}
		

		
		return job, nil
	}


type TaskFactory func(trigger models.TimeTrigger) gocron.Task

// CreateTaskFactory returns a function that builds tasks with service access
func (s *Service) CreateTaskFactory() TaskFactory {
	return func(t models.TimeTrigger) gocron.Task {

		if s.taskOverride != nil{
			return s.taskOverride(t)
		}

		return gocron.NewTask(func() {
			// Execute the actual action based on t.Action
			switch t.Action {
			case "send_email":
				log.Printf("Sending email for trigger ID %d", t.ID)
				// Actual email sending logic
				// Other action types...
			}
			
			// After execution, update the trigger state
			err := s.completeTriggerCycle(&t)
			if err != nil{
				log.Printf("⚠️ Failed to update trigger lifecycle for ID %d: %v", t.ID, err)
			}
		})
	}
}

// completeTriggerCycle handles the full post-execution lifecycle of a trigger.
// It marks the trigger as executed, computes the next scheduled run, updates
// the repository, and notifies the optional onTriggerComplete test hook.
func (s *Service) completeTriggerCycle(t *models.TimeTrigger) error {
    log.Printf("Completing trigger cycle for ID %d (Action: %s)", t.ID, t.Action)
    
    s.markTriggerExecuted(t)
    
    err := s.computeNextRun(t) 
	if err != nil {
        return fmt.Errorf("computeNextRun failed for trigger %d: %w", t.ID, err)
    }
    
    err = s.repo.UpdateTrigger(*t)
	if err != nil {
        return fmt.Errorf("update failed for trigger %d: %w", t.ID, err)
    }

	if s.onTriggerComplete != nil{
		s.onTriggerComplete(*t)
	}
    

    return nil
}

// validateJobNextRunMatch compares the expected NextRun time from the trigger
// with the actual scheduled NextRun time of the gocron job. It returns an error
// if the values do not match (to the nearest minute), ensuring scheduling consistency.
func (s *Service) validateJobNextRunMatch(t models.TimeTrigger, j gocron.Job) (error){
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

// jobEventOptions returns a JobOption that attaches event listeners to a gocron job.
// These listeners log job lifecycle events: start, success, and failure.
// Useful for observability and lightweight debugging.
func (s *Service) jobEventOptions(t models.TimeTrigger) gocron.JobOption {
	return gocron.WithEventListeners(
		gocron.BeforeJobRuns(func(id uuid.UUID, name string) {
			log.Printf("🟡 Event: Trigger %d is starting", t.ID)
		}),
		gocron.AfterJobRuns(func(id uuid.UUID, name string) {
			log.Printf("📈 Trigger ID %d executed at %s", t.ID, time.Now().UTC().Format(time.DateTime))
		}),
		gocron.AfterJobRunsWithError(func(id uuid.UUID, name string, err error) {
			log.Printf("❌ Event: Trigger %d failed with error: %v", t.ID, err)
		}),
	)
}

