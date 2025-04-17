package jobbuilder

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/stretchr/testify/require"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func nextFullMinute() time.Time {
	now := time.Now().UTC()

	return now.Add(1 * time.Minute).Truncate(time.Minute)
}

func makeTrigger(
	id int,
	interval, triggerAt, action string,
	dayOfWeek, dayOfMonth int,
) models.TimeTrigger {
	return models.TimeTrigger{
		ID:         uint(id),
		Interval:   interval,
		TriggerAt:  triggerAt,
		Action:     action,
		DayOfWeek:  dayOfWeek,
		DayOfMonth: dayOfMonth,
		NextRun:    nextFullMinute(),
	}
}

// mockTaskFactory is a simple task factory for testing purposes
func mockTaskFactory(t models.TimeTrigger) gocron.Task {
	return gocron.NewTask(func() {
		// This is a no-op task for testing
		fmt.Printf("mocktest factory hey this worked")
	})
}

func TestBuildJobConfig_ValidTriggers(t *testing.T) {
	tests := []struct {
		name    string
		trigger models.TimeTrigger
	}{
		{
			name:    "valid/daily",
			trigger: makeTrigger(1, "daily", "10:00", "send_email", 0, 0),
		},
		{
			name:    "valid/weekly",
			trigger: makeTrigger(2, "weekly", "11:30", "send_email", 3, 0), // Wednesday
		},
		{
			name:    "valid/monthly",
			trigger: makeTrigger(3, "monthly", "08:15", "send_email", 0, 15),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			jobCfg, err := BuildJobConfig(tc.trigger, mockTaskFactory)
			require.NoError(t, err)
			require.NotNil(t, jobCfg.Task)
			require.NotNil(t, jobCfg.Definition)
			require.Len(t, jobCfg.Options, 1)
			t.Logf("%s JobConfig:", tc.name)
			t.Log("\n✅ End of case:", tc.name)
			t.Log("\n")
			t.Log(strings.Repeat("-", 30))
		})
	}

	t.Log("\n\n\n")
}

func TestBuildJobConfig_InvalidTriggers(t *testing.T) {
	tests := []struct {
		name    string
		trigger models.TimeTrigger
	}{
		{
			name:    "invalid/action",
			trigger: makeTrigger(4, "daily", "09:00", "launch_rockets", 0, 0),
		},
		{
			name:    "invalid/interval",
			trigger: makeTrigger(5, "yearly", "11:00", "send_email", 0, 0),
		},
		{
			name:    "invalid/day of week",
			trigger: makeTrigger(6, "weekly", "23:04", "send_email", 10, 0),
		},
		{
			name:    "invalid/day of month",
			trigger: makeTrigger(7, "monthly", "14:00", "send_email", 0, 32),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// For invalid triggers, we need to provide the task factory too,
			// but the error should come from validation before the task is used
			_, err := BuildJobConfig(tc.trigger, mockTaskFactory)
			require.Error(t, err)
			t.Logf("Expected error for %s: %v", tc.name, err)

			t.Log("\n✅ End of case:", tc.name)
			t.Log("\n")
			t.Log(strings.Repeat("-", 30))
		})
	}
}
