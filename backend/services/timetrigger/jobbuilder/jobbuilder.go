package jobbuilder

import (
	"errors"
	"strconv"

	"github.com/go-co-op/gocron/v2"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type JobConfig struct {
	Task       gocron.Task
	Definition gocron.JobDefinition
	Options    []gocron.JobOption
}

var TestTaskOverride func(t models.TimeTrigger) gocron.Task

func BuildJobConfig(
	t models.TimeTrigger,
	taskFactory func(models.TimeTrigger) gocron.Task,
) (JobConfig, error) {
	task := taskFactory(t)
	if TestTaskOverride != nil {
		task = TestTaskOverride(t)
	}

	def, err := buildDefinition(t)
	if err != nil {
		return JobConfig{}, err
	}

	opts := buildOptions(t)

	return JobConfig{
		Task:       task,
		Definition: def,
		Options:    opts,
	}, nil
}

func buildDefinition(t models.TimeTrigger) (gocron.JobDefinition, error) {
	if t.NextRun.IsZero() {
		return nil, errors.New("NextRun must be set for job scheduling")
	}

	atTime := gocron.NewAtTime(uint(t.NextRun.Hour()), uint(t.NextRun.Minute()), 0)

	switch t.Interval {
	case "daily":
		return gocron.DailyJob(1, gocron.NewAtTimes(atTime)), nil
	case "weekly":
		dayOfWeek, err := getWeekDay(t.DayOfWeek)
		if err != nil {
			return nil, err
		}

		return gocron.WeeklyJob(1, gocron.NewWeekdays(dayOfWeek), gocron.NewAtTimes(atTime)), nil
	case "monthly":
		dayOfMonth, err := getDayOfTheMonth(t.DayOfMonth)
		if err != nil {
			return nil, err
		}

		return gocron.MonthlyJob(
			1,
			gocron.NewDaysOfTheMonth(dayOfMonth),
			gocron.NewAtTimes(atTime),
		), nil
	default:
		return nil, errors.New("invalid interval: " + t.Interval)
	}
}

func buildOptions(t models.TimeTrigger) []gocron.JobOption {
	typeTag := "trigger-" + strconv.FormatUint(uint64(t.ID), 10)
	actionTag := "action-" + t.Action
	opts := []gocron.JobOption{
		gocron.WithTags(typeTag, actionTag),
	}

	return opts
}
