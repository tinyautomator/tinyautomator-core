package timetrigger

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

// ComputeFirstRun returns the first valid run time for a given TimeTrigger.
// It uses the trigger's interval and TriggerAt to calculate the first occurrence
// after the current time, handling daily, weekly, and monthly logic.
func ComputeFirstRun(t models.TimeTrigger) (time.Time, error) {
	hour, min, err := parseTriggerAt(t.TriggerAt)
	if err != nil {
		return time.Time{}, err
	}

	now := time.Now().UTC()
	baseTime := time.Date(now.Year(), now.Month(), now.Day(), hour, min, 0, 0, time.UTC)

	switch t.Interval {
	case "daily":
		if baseTime.After(now) {
			return baseTime, nil
		}
		return baseTime.Add(24 * time.Hour), nil
	case "weekly":
		weekdayToday := int(now.Weekday())
		daysUntil := (7 + t.DayOfWeek - weekdayToday) % 7

		baseTime = baseTime.AddDate(0, 0, daysUntil)
		if baseTime.Before(now) {
			baseTime = baseTime.AddDate(0, 0, 7)
		}
		return baseTime, nil
	case "monthly":
		if baseTime.Day() != t.DayOfMonth {
			return time.Time{}, errors.New("invalid day of month: " + strconv.Itoa(t.DayOfMonth))
		}
		if baseTime.After(now) {
			return baseTime, nil
		}
		return baseTime.AddDate(0, 1, 0), nil
	default:
		return time.Time{}, errors.New("invalid interval: " + t.Interval)
	}
}

// calculateNextRun returns the next scheduled run time for a given TimeTrigger.
// It adds the appropriate interval to the current NextRun value.
// This function is only called after a trigger has been scheduled and executed,
// so it assumes that NextRun already represents the last scheduled execution time.
func calculateNextRun(t models.TimeTrigger) (time.Time, error) {
	switch t.Interval {
	case "daily":
		return t.NextRun.Add(24 * time.Hour), nil
	case "weekly":
		return t.NextRun.Add(7 * 24 * time.Hour), nil
	case "monthly":
		nextMonth := t.NextRun.AddDate(0, 1, 0)
		candidate := time.Date(
			nextMonth.Year(),
			nextMonth.Month(),
			t.DayOfMonth,
			t.NextRun.Hour(),
			t.NextRun.Minute(),
			0, 0, nextMonth.Location(),
		)
		if candidate.Day() != t.DayOfMonth {
			return time.Time{}, nil 
		}
		return candidate, nil
	case "once":
		return time.Time{}, nil
	default:
		return time.Time{}, errors.New("invalid interval: " + t.Interval)
	}
}

func parseTriggerAt(triggerAt string) (int, int, error) {
	parts := strings.Split(triggerAt, ":")
	if len(parts) != 2 {
		return 0, 0, errors.New("invalid triggerAt format")
	}


	hour, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, err
	}
	if hour < 0 || hour > 23 {
		return 0, 0, errors.New("hour must be between 1 and 24")
	}

	minute, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, err
	}
	if minute < 0 || minute > 59 {
		return 0, 0, errors.New("minute must be between 0 and 59")
	}

	return hour, minute, nil
}