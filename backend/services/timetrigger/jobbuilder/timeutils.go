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
func getWeekDay(dayOfWeek int) time.Weekday {
	return time.Weekday(dayOfWeek)
}

// Can be adapted to parse months
// For now, it just returns the day of the month
func getDayOfTheMonth(dayOfMonth int) int {
	return dayOfMonth
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

	minute, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, err
	}

	return hour, minute, nil
}