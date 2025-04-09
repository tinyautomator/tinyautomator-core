package timetrigger

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type triggerTestCase struct {
	name    		string
	trigger 		models.TimeTrigger
	valid   		bool
	shouldExecute   bool
}

func makeTimeTriggerWithOffset(id int, interval, action string, dayOfWeek, dayOfMonth int, offset time.Duration) models.TimeTrigger {
	t := time.Now().UTC()
	t = t.Truncate(time.Minute).Add(time.Minute).Add(offset) // Round up to the next minute
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



func getTestCases() map[string]func() triggerTestCase {
	var defaultOffset = 3 * time.Second

	return map[string]func() triggerTestCase{
		"valid/once": func() triggerTestCase {
			return triggerTestCase{
				name:          "valid/once",
				trigger:       makeTimeTriggerWithOffset(1, "once", "send_email", 0, 0, defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/daily": func() triggerTestCase {
			return triggerTestCase{
				name:          "valid/daily",
				trigger:       makeTimeTriggerWithOffset(2, "daily", "send_email", 0, 0, defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/weekly": func() triggerTestCase {
			return triggerTestCase{
				name:          "valid/weekly",
				trigger:       makeTimeTriggerWithOffset(3, "weekly", "send_email", int(time.Now().UTC().Weekday()), 0, defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/monthly": func() triggerTestCase {
			return triggerTestCase{
				name:          "valid/monthly",
				trigger:       makeTimeTriggerWithOffset(4, "monthly", "send_email", 0, time.Now().UTC().Day(), defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"invalid/unknown interval": func() triggerTestCase {
			return triggerTestCase{
				name:          "invalid/unknown interval",
				trigger:       makeTimeTriggerWithOffset(5, "yearly", "send_email", 0, 0, defaultOffset),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/unknown action": func() triggerTestCase {
			return triggerTestCase{
				name:          "invalid/unknown action",
				trigger:       makeTimeTriggerWithOffset(6, "once", "play_league_of_legends", 0, 0, defaultOffset),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/time format": func() triggerTestCase {
			t := time.Now().Add(defaultOffset)
			return triggerTestCase{
				name: "invalid/time format",
				trigger: models.TimeTrigger{
					ID:        7,
					Interval:  "once",
					Action:    "send_email",
					TriggerAt: "25:00", // invalid
					NextRun:   t,
				},
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of week": func() triggerTestCase {
			return triggerTestCase{
				name:          "invalid/day of week",
				trigger:       makeTimeTriggerWithOffset(8, "weekly", "send_email", 8, 0, defaultOffset), // invalid weekday
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of month": func() triggerTestCase {
			return triggerTestCase{
				name:          "invalid/day of month",
				trigger:       makeTimeTriggerWithOffset(9, "monthly", "send_email", 0, 32, defaultOffset), // invalid day
				valid:         false,
				shouldExecute: false,
			}
		},
	}
}

