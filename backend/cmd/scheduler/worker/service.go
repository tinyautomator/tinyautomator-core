package worker

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger/jobbuilder"
)

type WorkerService struct {
	repo      repositories.ScheduleRepository
	scheduler gocron.Scheduler
	logger    logrus.FieldLogger

	taskOverride      func(models.TimeTrigger) gocron.Task
	onTriggerComplete func(models.TimeTrigger)
}

func initScheduler(logger logrus.FieldLogger) (gocron.Scheduler, error) {
	adapter := NewGoCronLoggerAdapter(logger)

	// TODO: explore timeout option as well as instrumentation options
	s, err := gocron.NewScheduler(gocron.WithLocation(time.UTC), gocron.WithLogger(adapter))
	if err != nil {
		return nil, fmt.Errorf("failed to init gocron scheduler: %w", err)
	}

	return s, nil
}

func NewWorkerService(cfg config.AppConfig) (*WorkerService, error) {
	l := cfg.GetLogger()

	s, err := initScheduler(l)
	if err != nil {
		return nil, fmt.Errorf("failed to create worker service: %w", err)
	}

	return &WorkerService{
		repo:      cfg.GetScheduleRepository(),
		scheduler: s,
		logger:    l,
	}, nil
}

func (s *WorkerService) Start() {
	s.scheduler.Start()
}

func (s *WorkerService) Shutdown() {
	if err := s.scheduler.Shutdown(); err != nil {
		panic(err)
	}
}

func (s *WorkerService) ScheduleTrigger(t models.TimeTrigger) (gocron.Job, error) {
	err := s.validateTrigger(t)
	if err != nil {
		s.logger.WithField("trigger_id", t.ID).Error("error validating trigger")
		return nil, err
	}

	taskFactory := s.CreateTaskFactory()

	jobCfg, err := jobbuilder.BuildJobConfig(t, taskFactory)
	if err != nil {
		return nil, fmt.Errorf("error building job config for trigger ID %d: %w", t.ID, err)
	}

	jobCfg.Options = append(jobCfg.Options, s.jobEventOptions(t))

	job, err := s.scheduler.NewJob(jobCfg.Definition, jobCfg.Task, jobCfg.Options...)
	if err != nil {
		return nil, fmt.Errorf("error creating job for trigger ID %d: %w", t.ID, err)
	}

	err = s.validateJobNextRunMatch(t, job)
	if err != nil {
		s.logger.WithField("trigger_id", t.ID).Errorf("next run mismatch for: %v", err)

		return nil, err
	}

	return job, nil
}

func (s *WorkerService) GetDueTriggers(within time.Duration) ([]models.TimeTrigger, error) {
	triggers, err := s.repo.FetchTriggersScheduledWithinDuration(within)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due triggers from repo: %w", err)
	}

	return triggers, nil
}

// TODO: do we validate on read/write? validate job type?
func (s *WorkerService) validateTrigger(t models.TimeTrigger) error {
	switch t.Interval {
	case "daily":
		if t.DayOfWeek != 0 || t.DayOfMonth != 0 {
			return errors.New(
				"invalid trigger: daily triggers must not set dayOfWeek or dayOfMonth",
			)
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
			return errors.New(
				"invalid trigger: monthly triggers must set dayOfMonth between 1 and 31",
			)
		}

		if t.DayOfWeek != 0 {
			return errors.New("invalid trigger: monthly triggers must not set dayOfWeek")
		}

	default:
		return errors.New("invalid interval: " + t.Interval)
	}

	_, _, err := parseTriggerAt(t.TriggerAt)
	if err != nil {
		return errors.New("invalid trigger: " + t.TriggerAt + " is not a valid time format")
	}

	if t.NextRun.IsZero() {
		return errors.New("invalid trigger: next run time is not set")
	}

	return nil
}

type TaskFactory func(trigger models.TimeTrigger) gocron.Task

// CreateTaskFactory returns a function that builds tasks with service access
func (s *WorkerService) CreateTaskFactory() TaskFactory {
	return func(t models.TimeTrigger) gocron.Task {
		if s.taskOverride != nil {
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
			if err != nil {
				log.Printf("failed to update trigger lifecycle for ID %d: %v", t.ID, err)
			}
		})
	}
}

// completeTriggerCycle handles the full post-execution lifecycle of a trigger.
// It marks the trigger as executed, computes the next scheduled run, updates
// the repository, and notifies the optional onTriggerComplete test hook.
func (s *WorkerService) completeTriggerCycle(t *models.TimeTrigger) error {
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

	if s.onTriggerComplete != nil {
		s.onTriggerComplete(*t)
	}

	return nil
}

// validateJobNextRunMatch compares the expected NextRun time from the trigger
// with the actual scheduled NextRun time of the gocron job. It returns an error
// if the values do not match (to the nearest minute), ensuring scheduling consistency.
func (s *WorkerService) validateJobNextRunMatch(t models.TimeTrigger, j gocron.Job) error {
	jobNextRun, err := j.NextRun()
	if err != nil {
		return fmt.Errorf("unable to get the time of the next scheduled run: %w", err)
	}

	if !t.NextRun.Truncate(time.Minute).Equal(jobNextRun.Truncate(time.Minute)) {
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
func (s *WorkerService) jobEventOptions(t models.TimeTrigger) gocron.JobOption {
	return gocron.WithEventListeners(
		gocron.BeforeJobRuns(func(id uuid.UUID, name string) {
			log.Printf("🟡 Event: Trigger %d is starting", t.ID)
		}),
		gocron.AfterJobRuns(func(id uuid.UUID, name string) {
			log.Printf(
				"📈 Trigger ID %d executed at %s",
				t.ID,
				time.Now().UTC().Format(time.DateTime),
			)
		}),
		gocron.AfterJobRunsWithError(func(id uuid.UUID, name string, err error) {
			log.Printf("❌ Event: Trigger %d failed with error: %v", t.ID, err)
		}),
	)
}
