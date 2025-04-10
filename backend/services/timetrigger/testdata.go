package timetrigger

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type triggerTestCase struct {
	trigger 		models.TimeTrigger
	valid   		bool
	shouldExecute   bool
}

func getSmartTriggerAt() time.Time {
	now := time.Now().UTC()
	return now.Add(1 * time.Minute).Truncate(time.Minute) // push to next clean minute	
}
func makeTimeTriggerWithOffset(id int, interval, action string, dayOfWeek, dayOfMonth int, offset time.Duration) models.TimeTrigger {
	
	t := getSmartTriggerAt()
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
		"valid/daily": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(2, "daily", "send_email", 0, 0, defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/weekly": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(3, "weekly", "send_email", int(time.Now().UTC().Weekday()), 0, defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"valid/monthly": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(4, "monthly", "send_email", 0, time.Now().UTC().Day(), defaultOffset),
				valid:         true,
				shouldExecute: true,
			}
		},
		"invalid/unknown interval": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(5, "yearly", "send_email", 0, 0, defaultOffset),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/unknown action": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(6, "daily", "play_league_of_legends", 0, 0, defaultOffset),
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/time format": func() triggerTestCase {
			t := time.Now().Add(defaultOffset)
			return triggerTestCase{
				trigger: models.TimeTrigger{
					ID:        7,
					Interval:  "monthly",
					DayOfMonth: 15,
					TriggerAt: "25:00", // invalid
					NextRun:   t,
					Action:    "send_email",
				},
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of week": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(8, "weekly", "send_email", 8, 0, defaultOffset), // invalid weekday
				valid:         false,
				shouldExecute: false,
			}
		},
		"invalid/day of month": func() triggerTestCase {
			return triggerTestCase{
				trigger:       makeTimeTriggerWithOffset(9, "monthly", "send_email", 0, 32, defaultOffset), // invalid day
				valid:         false,
				shouldExecute: false,
			}
		},
	}
}

