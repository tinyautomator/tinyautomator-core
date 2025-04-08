// Purpose: This file contains utility functions for parsing time-related strings.
// in the future can be adapted to parse weekdays and months
package jobbuilder

import (
	"errors"
	"strconv"
	"strings"
	"time"
)

// Can be adapted to parse weekdays
// For now, it just returns the weekday as string assuming 0-6 (Sunday-Saturday)
func getWeekDay(dayOfWeek int) (time.Weekday, error) {
	if dayOfWeek < 0 || dayOfWeek > 6 {
		return 0, errors.New("dayOfWeek must be between 0 and 6")
	}
	return time.Weekday(dayOfWeek), nil
}

// Can be adapted to parse months
// For now, it just returns the day of the month
func getDayOfTheMonth(dayOfMonth int) (int, error) {
	if dayOfMonth < 1 || dayOfMonth > 31 {
		return 0, errors.New("dayOfMonth must be between 1 and 31")
	}
	return dayOfMonth, nil
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