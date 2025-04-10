package jobbuilder

import (
	"testing"

	"github.com/davecgh/go-spew/spew"
	"github.com/stretchr/testify/require"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)
func TestBuildJobConfig_DailyEmail_Valid(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:        2,
		Interval:  "daily",
		TriggerAt: "16:30",
		Action:    "send_email",
	}

	jobCfg, err := BuildJobConfig(trigger)
	require.NoError(t, err)
	require.NotNil(t, jobCfg.Task)
	require.NotNil(t, jobCfg.Definition)
	require.Len(t, jobCfg.Options, 1)

	t.Log("Daily Email JobConfig:")
	spew.Dump(jobCfg)
}

func TestBuildJobConfig_WeeklyEmail_Valid(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:        3,
		Interval:  "weekly",
		DayOfWeek: 3, // Wednesday
		TriggerAt: "10:00",
		Action:    "send_email",
	}

	jobCfg, err := BuildJobConfig(trigger)
	require.NoError(t, err)
	require.NotNil(t, jobCfg.Task)
	require.NotNil(t, jobCfg.Definition)
	require.Len(t, jobCfg.Options, 1)

	t.Log("Weekly Email JobConfig:")
	spew.Dump(jobCfg)
}

func TestBuildJobConfig_MonthlyEmail_Valid(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:         4,
		Interval:   "monthly",
		DayOfMonth: 15,
		TriggerAt:  "08:00",
		Action:     "send_email",
	}

	jobCfg, err := BuildJobConfig(trigger)
	require.NoError(t, err)
	require.NotNil(t, jobCfg.Task)
	require.NotNil(t, jobCfg.Definition)
	require.Len(t, jobCfg.Options, 1)

	t.Log("Monthly Email JobConfig:")
	spew.Dump(jobCfg)
}

func TestBuildJobConfig_InvalidAction(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:        5,
		Interval:  "daily",
		TriggerAt: "09:00",
		Action:    "launch_rockets", // Unsupported
	}

	_, err := BuildJobConfig(trigger)
	require.Error(t, err)
	t.Logf("Expected error for invalid action: %v", err)
}

func TestBuildJobConfig_InvalidInterval(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:        6,
		Interval:  "yearly", // Unsupported
		TriggerAt: "11:00",
		Action:    "send_email",
	}

	_, err := BuildJobConfig(trigger)
	require.Error(t, err)
	t.Logf("Expected error for invalid interval: %v", err)
}

func TestBuildJobConfig_InvalidTimeFormat(t *testing.T) {
	trigger := models.TimeTrigger{
		ID:        7,
		Interval:  "weekly",
		DayOfWeek: 10, // Invalid
		TriggerAt: "23:04", 
		Action:    "send_email",
	}

	_, err := BuildJobConfig(trigger)
	require.Error(t, err)
	t.Logf("Expected error for invalid time format: %v", err)
}
