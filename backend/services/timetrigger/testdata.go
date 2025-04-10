package timetrigger

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)


func nextFullMinute() time.Time {
	now := time.Now().UTC()
	return now.Add(1 * time.Minute).Truncate(time.Minute) 
}
func makeTestTrigger(id int, interval string, action string, dayOfWeek int, dayOfMonth int, t time.Time) models.TimeTrigger {
	return models.TimeTrigger{
		ID:         uint(id),
		Interval:   interval,
		Action:     action,
		DayOfWeek:  dayOfWeek,
		DayOfMonth: dayOfMonth,
		TriggerAt:  t.Format("15:04"),
		NextRun:    t,
	}
}


type triggerTestCase struct {
	trigger 		models.TimeTrigger
	valid   		bool
	shouldExecute   bool
}

func getTestCases() map[string]func() triggerTestCase {


	return map[string]func() triggerTestCase{
		"valid/daily": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(2, "daily", "send_email", 0, 0, nextFullMinute()),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/weekly": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(3, "weekly", "send_email", int(time.Now().UTC().Weekday()), 0, nextFullMinute()),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/monthly": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(4, "monthly", "send_email", 0, time.Now().UTC().Day(), nextFullMinute()),
				valid:         true,
				shouldExecute: true,
			}
		},
		"invalid/unknown interval": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(5, "yearly", "send_email", 0, 0, nextFullMinute()),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/unknown action": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(6, "daily", "play_league_of_legends", 0, 0, nextFullMinute()),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/time format": func() triggerTestCase {
			return triggerTestCase{
				trigger: models.TimeTrigger{
					ID:        7,
					Interval:  "monthly",
					DayOfMonth: 15,
					TriggerAt: "25:00", // invalid
					NextRun:   nextFullMinute(),
					Action:    "send_email",
				},
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of week": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(8, "weekly", "send_email", 8, 0, nextFullMinute()), // invalid weekday
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of month": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTestTrigger(9, "monthly", "send_email", 0, 32, nextFullMinute()), // invalid day
				valid:         false,
				shouldExecute: false,
			}
		},
	}
}

type ComputeFirstRunTestCase struct {
	Name 	     string
	Trigger      models.TimeTrigger
	Now 	     time.Time
	ExpectedRun  time.Time
	ExpectErr    bool
}
type makeTestTriggerOpt struct {
	action string
	dayOfWeek int
	dayOfMonth int
}
func defaultOpts() makeTestTriggerOpt {
	return makeTestTriggerOpt{
		action:     "send_email",
		dayOfWeek:  -1,
		dayOfMonth: -1,
	}
}
func tr(id int, interval string, t time.Time, opt makeTestTriggerOpt) models.TimeTrigger {
	if opt.action == "" {
		opt.action = "send_email"
	}
	if opt.dayOfWeek == -1 {
		opt.dayOfWeek = int(t.Weekday())
	}
	if opt.dayOfMonth == -1 {
		opt.dayOfMonth = t.Day()
	}		

	return models.TimeTrigger{
		ID:         uint(id),
		Interval:   interval,
		Action:     opt.action,
		DayOfWeek:  opt.dayOfWeek,
		DayOfMonth: opt.dayOfMonth,
		TriggerAt:  t.Format("15:04"),
		NextRun:    t,
	}
}

func getComputeFirstRunTestCases() []ComputeFirstRunTestCase {
	now := time.Now().UTC().Truncate(time.Minute)

	return []ComputeFirstRunTestCase{
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
				dayOfWeek: int(now.Weekday()),
			}),
			ExpectedRun: now.Add(1 * time.Hour),
			ExpectErr: false,
		},
		{
			Name: "valid/weekly/same weekday past",
			Now: now,
			Trigger: tr(4, "weekly", now.Add(-2*time.Hour), makeTestTriggerOpt{
				dayOfWeek: int(now.Weekday()),
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
				dayOfMonth: now.Day(),
			}),
			ExpectedRun: now.Add(90 * time.Minute),
			ExpectErr: false,
		},
		{
			Name: "valid/monthly/trigger passed today",
			Now: now,
			Trigger: tr(6, "monthly", now.Add(-2*time.Hour), makeTestTriggerOpt{
				dayOfMonth: now.Day(),
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
		{
			Name: "invalid/monthly/feb 29 non-leap year",
			Now: time.Date(2025, 2, 1, 10, 0, 0, 0, time.UTC),
			Trigger: tr(11, "monthly", time.Date(2025, 2, 1, 10, 0, 0, 0, time.UTC), makeTestTriggerOpt{
				dayOfMonth: 29,
			}),
			ExpectErr: true,
		},
			
	}
}
