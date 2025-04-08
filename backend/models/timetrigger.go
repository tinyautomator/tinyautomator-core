// TODO: Implement grom model for TimeTrigger

package models

import "time"

type TimeTrigger struct {
    ID         uint
    Interval   string        // "once", "daily", "weekly", "monthly"
	DayOfWeek  int       	 // 0-6 (Sunday-Saturday), optional for "weekly" interval
	DayOfMonth int       	 // 1-31, optional for "monthly" interval
	TriggerAt  string    	 // "HH:MM" format
    NextRun    time.Time 	 // Optional: used for optimization	
	
	Action	   string        // Action to be performed i.e. "send_email"
}