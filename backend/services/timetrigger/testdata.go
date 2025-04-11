package timetrigger

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)


func nextFullMinute() time.Time {
	now := time.Now().UTC()
	return now.Add(1 * time.Minute).Truncate(time.Minute) 
}

type triggerTestCase struct {
	trigger       models.TimeTrigger
	valid         bool
	shouldExecute bool
}

func makeTestTrigger(id int, interval string, action string, dayOfWeek int, dayOfMonth int, time time.Time, lastRun time.Time) models.TimeTrigger {
	return models.TimeTrigger{
		ID:         uint(id),
		Interval:   interval,
		Action:     action,
		DayOfWeek:  dayOfWeek,
		DayOfMonth: dayOfMonth,
		TriggerAt:  time.Format("15:04"),
		NextRun:    time,
		LastRun:    lastRun,
	}
}

func allTriggerTestCases() map[string]triggerTestCase {
	return map[string]triggerTestCase{
		"valid/daily": {
			trigger:       makeTestTrigger(2, "daily", "send_email", 0, 0, nextFullMinute(), time.Time{}),
			valid:         true,
			shouldExecute: true,
		},
		"valid/weekly": {
			trigger:       makeTestTrigger(3, "weekly", "send_email", int(time.Now().UTC().Weekday()), 0, nextFullMinute(), time.Time{}),
			valid:         true,
			shouldExecute: true,
		},
		"valid/monthly": {
			trigger:       makeTestTrigger(4, "monthly", "send_email", 0, time.Now().UTC().Day(), nextFullMinute(), time.Time{}),
			valid:         true,
			shouldExecute: true,
		},
		"invalid/unknown interval": {
			trigger:       makeTestTrigger(5, "yearly", "send_email", 0, 0, nextFullMinute(), time.Time{}),
			valid:         false,
			shouldExecute: false,
		},
		"invalid/unknown action": {
			trigger:       makeTestTrigger(6, "daily", "play_league_of_legends", 0, 0, nextFullMinute(), time.Time{}),
			valid:         false,
			shouldExecute: false,
		},
		"invalid/time format": {
			trigger: models.TimeTrigger{
				ID:         7,
				Interval:   "monthly",
				DayOfMonth: 15,
				TriggerAt:  "25:00", // invalid
				NextRun:    nextFullMinute(),
				Action:     "send_email",
			},
			valid:         false,
			shouldExecute: false,
		},
		"invalid/day of week": {
			trigger:       makeTestTrigger(8, "weekly", "send_email", 8, 0, nextFullMinute(), time.Time{}), // invalid weekday
			valid:         false,
			shouldExecute: false,
		},
		"invalid/day of month": {
			trigger:       makeTestTrigger(9, "monthly", "send_email", 0, 32, nextFullMinute(), time.Time{}), // invalid day
			valid:         false,
			shouldExecute: false,
		},
	}
}

//  Use for ValidateTrigger() tests
func getTriggerValidationCases() map[string]triggerTestCase {
	return allTriggerTestCases() // All cases relevant
}

//  Use for ScheduleTrigger() tests
func getSchedulingTestCases() map[string]triggerTestCase {
	return allTriggerTestCases() // Reuse same set for now, can filter if needed later
}
type TimeRunCalculationTestCase struct {
	Name 	     string
	Now 	     time.Time
	Trigger      models.TimeTrigger
	ExpectedRun  time.Time
	ExpectErr    bool
}
type makeTestTriggerOpt struct {
	action 		string
	dayOfWeek 	int
	dayOfMonth 	int
	lastRun 	time.Time
}
func defaultOpts() makeTestTriggerOpt {
	return makeTestTriggerOpt{
		action:     "send_email",
		dayOfWeek:  -1,
		dayOfMonth: -1,
		lastRun: time.Time{},
	}
}
func tr(id int, interval string, time time.Time, opt makeTestTriggerOpt) models.TimeTrigger {
	if opt.action == "" {
		opt.action = "send_email"
	}
	if opt.dayOfWeek == -1 {
		opt.dayOfWeek = int(time.Weekday())
	}
	if opt.dayOfMonth == -1 {
		opt.dayOfMonth = time.Day()
	}
	
	return models.TimeTrigger{
		ID:         uint(id),
		Interval:   interval,
		Action:     opt.action,
		DayOfWeek:  opt.dayOfWeek,
		DayOfMonth: opt.dayOfMonth,
		TriggerAt:  time.Format("15:04"),
		NextRun:    time,
		LastRun:    opt.lastRun,
	}
}

func getComputeFirstRunTestCases() []TimeRunCalculationTestCase {
	now := time.Now().UTC().Truncate(time.Minute)

	return []TimeRunCalculationTestCase{
		{
			Name: "valid/daily/trigger time later today",
			Now: now,
			Trigger: tr(1, "daily", now.Add(1*time.Hour), defaultOpts()),
			ExpectedRun: now.Add(1 * time.Hour),
			ExpectErr: false,
		},
		{
			Name: "valid/daily/trigger time passed today",
			Now: now,
			Trigger: tr(2, "daily", now.Add(-2*time.Hour), defaultOpts()),
			ExpectedRun: now.Add(22 * time.Hour),
			ExpectErr: false,
		},
		{
			Name: "valid/weekly/same weekday future",
			Now: now,
			Trigger: tr(3, "weekly", now.Add(1*time.Hour), makeTestTriggerOpt{
				dayOfWeek: int(now.Add(1 * time.Hour).Weekday()),
			}),
			ExpectedRun: now.Add(1 * time.Hour),
			ExpectErr: false,
		},
		{
			Name: "valid/weekly/same weekday past",
			Now: now,
			Trigger: tr(4, "weekly", now.Add(-2*time.Hour), makeTestTriggerOpt{
				dayOfWeek: int(now.Add(-2 * time.Hour).Weekday()),
			}),
			
			ExpectedRun: now.Add(-2 * time.Hour).Add(7 * 24 * time.Hour), // next week 2 hours in the past
			ExpectErr: false,
		},
		{
			Name: "valid/weekly/different future weekday",
			Now: now,
			Trigger: tr(8, "weekly", now.Add(48*time.Hour), makeTestTriggerOpt{
				dayOfWeek: (int(now.Weekday()) + 2) % 7, // 2 days ahead
			}),
			ExpectedRun: now.Add(48 * time.Hour),
			ExpectErr: false,
		},
		{
			Name: "valid/weekly/different past weekday",
			Now: now,
			Trigger: tr(9, "weekly", now.Add(-48*time.Hour), makeTestTriggerOpt{
				dayOfWeek: (int(now.Weekday()) + 5) % 7, // 2 days ago
			}),
			ExpectedRun: now.Add(-48 * time.Hour).Add(7 * 24 * time.Hour),
			ExpectErr: false,
		},
		
		{
			Name: "valid/monthly/trigger later today",
			Now: now,
			Trigger: tr(5, "monthly", now.Add(90*time.Minute), makeTestTriggerOpt{
				dayOfMonth: now.Add(90 * time.Minute).Day(),
			}),
			ExpectedRun: now.Add(90 * time.Minute),
			ExpectErr: false,
		},
		{
			Name: "valid/monthly/trigger passed today",
			Now: now,
			Trigger: tr(6, "monthly", now.Add(-2*time.Hour), makeTestTriggerOpt{
				dayOfMonth: now.Add(-2 * time.Hour).Day(),
			}),
			ExpectedRun: now.Add(-2 * time.Hour).Add(30 * 24 * time.Hour), // next month 2 hours in the past
			ExpectErr: false,
		},
		
		{
			Name: "invalid/monthly/invalid date (Feb 31)",
			Now: time.Date(2025, 2, 1, 10, 0, 0, 0, time.UTC),
			Trigger: tr(6, "monthly", time.Date(2025, 2, 1, 10, 0, 0, 0, time.UTC), makeTestTriggerOpt{
				dayOfMonth: 31,
			}),
			ExpectErr: true,
		},
		{
			Name: "invalid/unknown interval",
			Now: now,
			Trigger: tr(7, "every_other_day", now, defaultOpts()),
			ExpectErr: true,
		},		
	}
}

func getComputeNextRunTestCases() []TimeRunCalculationTestCase {
	now := time.Now().UTC().Truncate(time.Minute)

	return []TimeRunCalculationTestCase{
		{
			Name: "valid/daily",
			Trigger: tr(1, "daily", now, makeTestTriggerOpt{
				lastRun: now.Add(-24 * time.Hour),
			}),
			ExpectedRun: now,
			ExpectErr:   false,
		},
		{
			Name: "valid/weekly",
			Trigger: tr(2, "weekly", now, makeTestTriggerOpt{
				dayOfWeek: int(now.Weekday()),
				lastRun:   now.Add(-7 * 24 * time.Hour),
			}),
			ExpectedRun: now,
			ExpectErr:   false,
		},
		{
			Name: "valid/monthly",
			Trigger: tr(3, "monthly", now, makeTestTriggerOpt{
				dayOfMonth: now.Day(),
				lastRun:    now.AddDate(0, -1, 0),
			}),
			ExpectedRun: now,
			ExpectErr:   false,
		},
		{
			Name: "valid/monthly/feb 29 non-leap year",
			Now:  time.Date(2025, 2, 01, 10, 0, 0, 0, time.UTC),
			Trigger: tr(5, "monthly",time.Date(2025, 2, 01, 10, 0, 0, 0, time.UTC) , makeTestTriggerOpt{
				dayOfMonth: 29,
				lastRun:    time.Date(2025, 1, 29, 1, 0, 0, 0, time.UTC),
			}),
			ExpectedRun: time.Date(2025, 3, 29, 1, 0 ,0 , 0, time.UTC),
			ExpectErr: false,
		},
		{
			Name: "invalid/daily/last run in future",
			Trigger: tr(6, "daily", now, makeTestTriggerOpt{
				lastRun: now.Add(24 * time.Hour), // last run is in the future
			}),
			ExpectErr: true,
		},
		{
			Name: "invalid/unknown interval",
			Trigger: tr(4, "every_other_day", now, makeTestTriggerOpt{
				lastRun: now.Add(-48 * time.Hour),
			}),
			ExpectErr: true,
		},
		
	}
}
