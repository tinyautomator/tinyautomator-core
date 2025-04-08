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
	// Define the task
	var task gocron.Task
	switch t.Action {
	case "send_email":
		task = gocron.NewTask(func() {
			// TODO : Implement the email sending logic
			// This is a placeholder for the actual email sending logic

			log.Printf("Sending email for trigger ID %d", t.ID)
		})

	default:
		return JobConfig{}, errors.New("unknown action: " + t.Action)
	}
	

	hour, min, err := parseTriggerAt(t.TriggerAt)
	if err != nil {
		return JobConfig{}, err
	}
	atTime := gocron.NewAtTime(uint(hour), uint(min), 0)

	// Build the job definition
	var def gocron.JobDefinition
	switch t.Interval {
	case "once":
		def = gocron.OneTimeJob(gocron.OneTimeJobStartDateTime(t.NextRun))
	case "daily":
		def = gocron.DailyJob(1, gocron.NewAtTimes(atTime))
	case "weekly":
		def = gocron.WeeklyJob(1, gocron.NewWeekdays(GetWeekDay(t.DayOfWeek)), gocron.NewAtTimes(atTime))
	case "monthly":
		def = gocron.MonthlyJob(1, gocron.NewDaysOfTheMonth(getDayOfTheMonth(t.DayOfMonth)), gocron.NewAtTimes(atTime))
	default:
		return JobConfig{}, errors.New("invalid interval: " + t.Interval)
	}

	// Job options (e.g., tagging)
	tag := "trigger-" + strconv.FormatUint(uint64(t.ID), 10)
	opts := []gocron.JobOption{
		gocron.WithTags(tag),
	}

	return JobConfig{
		Definition: def,
		Task:       task,
		Options:    opts,
	}, nil
}
