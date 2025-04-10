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

var TestTaskOverride func(t models.TimeTrigger) gocron.Task


func buildTask(t models.TimeTrigger) (gocron.Task, error) {
	if TestTaskOverride != nil {
		return TestTaskOverride(t), nil
	}

	
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
	if t.NextRun.IsZero() {
		return nil, errors.New("NextRun must be set for job scheduling")
	}
	
	
	atTime := gocron.NewAtTime(uint(t.NextRun.Hour()), uint(t.NextRun.Minute()), 0)

	switch t.Interval {
	case "daily":
		return gocron.DailyJob(1, gocron.NewAtTimes(atTime)), nil
	case "weekly":
		var dayOfWeek, err = getWeekDay(t.DayOfWeek)
		if err != nil {
			return nil, err
		}
		return gocron.WeeklyJob(1, gocron.NewWeekdays(dayOfWeek), gocron.NewAtTimes(atTime)), nil
	case "monthly":
		var dayOfMonth, err = getDayOfTheMonth(t.DayOfMonth)
		if err != nil {
			return nil, err
		}
		return gocron.MonthlyJob(1, gocron.NewDaysOfTheMonth(dayOfMonth), gocron.NewAtTimes(atTime)), nil
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
