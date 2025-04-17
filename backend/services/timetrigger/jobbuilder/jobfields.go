// Purpose: Contains helper functions for validating and interpreting user-defined job fields
// such as day of the week and day of the month. Used during job configuration and scheduling.

package jobbuilder

import (
	"errors"
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
