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

	switch t.Interval {
	case "daily":
		baseTime := time.Date(now.Year(), now.Month(), now.Day(), hour, min, 0, 0, time.UTC)
		if baseTime.After(now) {
			return baseTime, nil
		}
		return baseTime.Add(24 * time.Hour), nil

	case "weekly":
		// calculate date of this week's target weekday
		daysToAdd := (7 + t.DayOfWeek - int(now.Weekday())) % 7
		scheduledDay := now.AddDate(0, 0, daysToAdd)
		baseTime := time.Date(scheduledDay.Year(), scheduledDay.Month(), scheduledDay.Day(), hour, min, 0, 0, time.UTC)

		if baseTime.After(now) {
			return baseTime, nil
		}
		return baseTime.AddDate(0, 0, 7), nil

	case "monthly":
		baseTime := time.Date(now.Year(), now.Month(), t.DayOfMonth, hour, min, 0, 0, time.UTC)

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
// It uses the LastRun value to determine the next interval.
// This function is only called after a trigger has been executed,
// so it assumes LastRun is set and accurate.
func (s *Service) computeNextRun(t *models.TimeTrigger) error {
	now := time.Now().UTC()

	if t.LastRun.After(now.Add(1 * time.Minute)) {
		return errors.New(
			"invalid lastRun: " + t.LastRun.Format(time.DateTime) +
				" is too far in the future (now = " + now.Format(time.DateTime) + ")",
		)
	}

	switch t.Interval {
	case "daily":
		t.NextRun = t.LastRun.Add(24 * time.Hour)
		return nil

	case "weekly":
		t.NextRun = t.LastRun.Add(7 * 24 * time.Hour)
		return nil

	case "monthly":
		nextMonth := t.LastRun.AddDate(0, 1, 0)
		candidate := time.Date(
			nextMonth.Year(),
			nextMonth.Month(),
			t.DayOfMonth,
			t.LastRun.Hour(),
			t.LastRun.Minute(),
			0, 0, nextMonth.Location(),
		)

		// If the candidate date was adjusted by overflow (e.g., Feb 31 → Mar 2), reject
		if candidate.Day() != t.DayOfMonth {
			return errors.New("invalid dayOfMonth for the computed month")
		}

		t.NextRun = candidate
		return nil
	default:
		return errors.New("invalid interval: " + t.Interval)
	}
}


// updateLastRun updates the LastRun field of a TimeTrigger to the current NextRun value.
// Since this function is called after the trigger has been executed,
// it sets LastRun to the time when the trigger was last executed.
func (s *Service) markTriggerExecuted(t *models.TimeTrigger)  {
	// Promote current NextRun to LastRun for rescheduling
	t.LastRun = t.NextRun
}

// parseTriggerAt parses the TriggerAt string in "HH:MM" format and returns the hour and minute as integers.
// It also validates the hour and minute values to ensure they are within valid ranges.
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
		return 0, 0, errors.New("hour must be between 0 and 23")
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

