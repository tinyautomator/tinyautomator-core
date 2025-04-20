package scheduler

import (
	"fmt"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type GocronScheduler struct {
	scheduler gocron.Scheduler
	logger    logrus.FieldLogger
}

// TODO: explore timeout option as well as instrumentation options
func NewGoCronScheduler(cfg config.AppConfig) (*GocronScheduler, error) {
	adapter := NewGoCronLoggerAdapter(cfg.GetLogger())

	s, err := gocron.NewScheduler(
		gocron.WithLocation(time.UTC),
		gocron.WithLogger(adapter),
	)
	if err != nil {
		return nil, fmt.Errorf("error while init gocron scheduler: %w", err)
	}

	return &GocronScheduler{
		scheduler: s,
		logger:    cfg.GetLogger(),
	}, nil
}

func (g *GocronScheduler) Start() error {
	g.scheduler.Start()

	return nil
}

func (g *GocronScheduler) Shutdown() error {
	if err := g.scheduler.Shutdown(); err != nil {
		return fmt.Errorf("error while shutting down gocron scheduler: %w", err)
	}

	return nil
}

func (g *GocronScheduler) Schedule(ws *dao.WorkflowSchedule) error {
	def, err := g.buildJobDefinitionFromSchedule(ws)
	if err != nil {
		return err
	}

	opts := g.buildJobOptionsFromSchedule(ws)

	task := gocron.NewTask(func() {
		// TODO: implement executor logic here
	})

	_, err = g.scheduler.NewJob(def, task, opts...)
	if err != nil {
		return fmt.Errorf("error enqueuing job into gocron: %w", err)
	}

	return nil
}

func (g *GocronScheduler) Unschedule(scheduleID int64) error {
	// optionally use job tags or map to cancel a job
	return nil
}

func (g *GocronScheduler) buildJobDefinitionFromSchedule(
	ws *dao.WorkflowSchedule,
) (gocron.JobDefinition, error) {
	if ws == nil {
		return nil, fmt.Errorf("schedule is nil")
	}

	if !ws.NextRunAt.Valid {
		return nil, fmt.Errorf("schedule ID %s has no next_run_at", ws.ID)
	}

	runAt := time.UnixMilli(ws.NextRunAt.Int64)
	hour, min, _ := runAt.Clock()
	atTime := gocron.NewAtTime(uint(hour), uint(min), 0)

	switch ws.ScheduleType {
	case "once":
		return gocron.OneTimeJob(gocron.OneTimeJobStartDateTime(runAt)), nil

	case "daily":
		return gocron.DailyJob(1, gocron.NewAtTimes(atTime)), nil

	case "weekly":
		weekday := runAt.Weekday()
		return gocron.WeeklyJob(1, gocron.NewWeekdays(weekday), gocron.NewAtTimes(atTime)), nil

	case "monthly":
		day := runAt.Day()
		return gocron.MonthlyJob(1, gocron.NewDaysOfTheMonth(day), gocron.NewAtTimes(atTime)), nil

	default:
		return nil, fmt.Errorf("unsupported schedule_type: %s", ws.ScheduleType)
	}
}

func (g *GocronScheduler) buildJobOptionsFromSchedule(ws *dao.WorkflowSchedule) []gocron.JobOption {
	u, err := uuid.Parse(ws.ID)
	if err != nil {
		// TODO: do we surface an error here?
		g.logger.WithError(err).
			WithField("schedule_id", ws.ID).
			Error("invalid UUID for workflow schedule")
	}

	eventListenerOpt := gocron.WithEventListeners(
		gocron.BeforeJobRuns(func(id uuid.UUID, name string) {
			g.logger.Info("event: workflow id %d is starting", ws.WorkflowID)
		}),
		gocron.AfterJobRuns(func(id uuid.UUID, name string) {
			g.logger.Info(
				"workflow id %d executed at %s",
				ws.WorkflowID,
				time.Now().UTC().Format(time.DateTime),
			)

			for _, j := range g.scheduler.Jobs() {
				u, err := uuid.Parse(ws.ID)
				if err != nil {
					g.logger.WithError(err).Error("stored schedule job ID was not UUID")
				}

				if j.ID() == u {
					// do something
				}
			}
		}),
		gocron.AfterJobRunsWithError(func(id uuid.UUID, name string, err error) {
			g.logger.Errorf("event: workflow if %d failed with error: %v", ws.WorkflowID, err)
		}),
	)

	opts := []gocron.JobOption{
		gocron.WithIdentifier(u),
		eventListenerOpt,
	}

	return opts
}

var _ WorkflowScheduler = (*GocronScheduler)(nil)
