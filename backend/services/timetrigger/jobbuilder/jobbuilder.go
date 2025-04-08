package jobbuilder

import (
	"errors"
	"log"
	"strconv"

	"github.com/go-co-op/gocron/v2"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type JobConfig struct {
	Task       gocron.Task
	Definition gocron.JobDefinition
	Options    []gocron.JobOption
}

func BuildJobConfig(t models.TimeTrigger) (JobConfig, error) {
	task, err := buildTask(t)
	if err != nil {
		return JobConfig{}, err
	}

	def, err := buildDefinition(t)
	if err != nil {
		return JobConfig{}, err
	}

	opts, err := buildOptions(t)
	if err != nil {
		return JobConfig{}, err
	}

	return JobConfig{
		Task:       task,
		Definition: def,
		Options:    opts,
	}, nil
}

func buildTask(t models.TimeTrigger) (gocron.Task, error) {
	switch t.Action {
	case "send_email":
		return gocron.NewTask(func() {
			log.Printf("Sending email for trigger ID %d", t.ID)
		}), nil
	default:
		return nil, errors.New("unknown action: " + t.Action)
	}
}

func buildDefinition(t models.TimeTrigger) (gocron.JobDefinition, error) {
	hour, min, err := parseTriggerAt(t.TriggerAt)
	if err != nil {
		return nil, err
	}
	atTime := gocron.NewAtTime(uint(hour), uint(min), 0)

	switch t.Interval {
	case "once":
		return gocron.OneTimeJob(gocron.OneTimeJobStartDateTime(t.NextRun)), nil
	case "daily":
		return gocron.DailyJob(1, gocron.NewAtTimes(atTime)), nil
	case "weekly":
		return gocron.WeeklyJob(1, gocron.NewWeekdays(getWeekDay(t.DayOfWeek)), gocron.NewAtTimes(atTime)), nil
	case "monthly":
		return gocron.MonthlyJob(1, gocron.NewDaysOfTheMonth(getDayOfTheMonth(t.DayOfMonth)), gocron.NewAtTimes(atTime)), nil
	default:
		return nil, errors.New("invalid interval: " + t.Interval)
	}
}


func buildOptions(t models.TimeTrigger) ([]gocron.JobOption, error) {
	typeTag := "trigger-" + strconv.FormatUint(uint64(t.ID), 10)
	actionTag := "action-" + t.Action
	opts := []gocron.JobOption{
		gocron.WithTags(typeTag, actionTag),
	}
	return opts, nil
}
