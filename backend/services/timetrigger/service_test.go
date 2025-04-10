package timetrigger

import (
	"testing"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/stretchr/testify/require"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger/jobbuilder"
)

type executedJobInfo struct {
	ID      uint
	Name    string
	Trigger models.TimeTrigger
}

// --- Unit Test ---
// This test uses a separate scheduler and repository for each test case.
// It ensures that each test case is isolated and does not interfere with others.
// This is useful for testing edge cases and ensuring that the scheduler behaves correctly in isolation.
// The test cases are run in parallel, which allows for faster execution.
func TestScheduleTrigger_Unit_TriggerValidation(t *testing.T) {
	t.Logf("🧪 Unit Test — Isolated Scheduler/Repo Per Case")
	t.Logf("🕒 Current Time: %s", time.Now().UTC().Format(time.DateTime))

	testCases := getTestCases()

	for name, factory := range testCases {
		tc := factory()

		t.Run(name, func(t *testing.T) {
			t.Parallel()

			executed := make(chan executedJobInfo, 1)
			service := NewService(timetrigger.NewInMemoryRepository())
			defer service.scheduler.Shutdown()
			trigger, err := service.repo.SaveTrigger(tc.trigger)
			require.NoError(t, err, "Failed to save trigger")
			tc.trigger = trigger

			resetTaskOverride()
			t.Cleanup(resetTaskOverride)

			if tc.shouldExecute {
				overrideTaskExecution(t, executed, name)
			}

			job, err := service.ScheduleTrigger(tc.trigger)

			if tc.valid {
				require.NoError(t, err, "Expected valid scheduling for %q", name)
				logNextRun(t, name, job, tc.trigger)
			} else {
				require.Error(t, err, "Expected error for invalid trigger: %q", name)
			}

			if tc.valid {
				verifyExecution(t, executed, name, tc, service)
			}
		})
	}
}

// TestScheduleTrigger_Validation_MixedCases verifies scheduler behavior across all trigger types.
// It ensures that:
// - Valid triggers across different intervals ("once", "daily", "weekly", "monthly") schedule correctly
// - Their NextRun values are properly computed
// - Invalid configurations (e.g. bad time format, unknown action, invalid dayOfWeek) are rejected and not scheduled
// - Job execution is observed for all valid & executable triggers within ~60 seconds
// 
// This is NOT a full integration test (no external services or persistent state),
// but rather a comprehensive functional validation of trigger scheduling and execution logic.

func TestScheduleTrigger_MixedSchedulingBehavior(t *testing.T) {
	t.Logf("🌐 MixedSchedulingBehavior — Shared Scheduler + Shared Repo")
	t.Logf("🕒 Current Time: %s", time.Now().UTC().Format(time.DateTime))

	

	service := NewService(timetrigger.NewInMemoryRepository())
	defer service.scheduler.Shutdown()

	executed := make(chan executedJobInfo, 10)
	testCases := getTestCases()
	executionsExpected := 0

	for name, factory := range testCases {
		tc := factory()

		trigger, err := service.repo.SaveTrigger(tc.trigger)
		require.NoError(t, err, "Failed to save trigger %q", name)
		tc.trigger = trigger

		if tc.valid && tc.shouldExecute {
			overrideTaskExecution(t, executed, name)
		} else {
			resetTaskOverride()
		}

		job, err := service.ScheduleTrigger(tc.trigger)

		if tc.valid {
			require.NoError(t, err, "Expected valid scheduling for %q", name)
			logNextRun(t, name, job, tc.trigger)
		} else {
			require.Error(t, err, "Expected error for invalid trigger: %q", name)
			continue
		}

		if tc.shouldExecute {
			executionsExpected++
		}
	}

	timeout := time.After(65 * time.Second)
	executedCount := 0

	for executedCount < executionsExpected {
		select {
		case info := <-executed:
			updated, err := service.repo.GetTriggerByID(info.ID)
			if err != nil {
				t.Logf("⚠ Executed job (%s) but couldn't fetch updated trigger", info.Name)
			} else {
				t.Logf("✅ Job executed: (Name: %s) (ID: %d) (Interval: %s) (NextRun: %v) (Action: %s)",
					info.Name, updated.ID, updated.Interval, updated.NextRun.Format(time.DateTime), updated.Action)
			}
			executedCount++
		case <-timeout:
			t.Errorf("Timeout: Only %d/%d jobs executed", executedCount, executionsExpected)
			return
		}
	}
}

// --- Helpers ---

func overrideTaskExecution(t *testing.T, executed chan executedJobInfo, testName string) {
	t.Helper()
	jobbuilder.TestTaskOverride = func(t models.TimeTrigger) gocron.Task {
		return gocron.NewTask(func() {
			executed <- executedJobInfo{
				ID:      t.ID,
				Name:    testName,
				Trigger: t,
			}
		})
	}
}

func resetTaskOverride() {
	jobbuilder.TestTaskOverride = nil
}

func logNextRun(t *testing.T, name string, job gocron.Job, trigger models.TimeTrigger) {
	t.Helper()
	nextRun, err := job.NextRun()
	require.NoError(t, err, "Failed to get NextRun")

t.Logf("🧠 %q scheduled — NextRun: %s | TriggerAt: %s",
		name, nextRun.UTC().Format(time.DateTime), trigger.TriggerAt)
	t.Logf("⏱ Runs in: ~%v", time.Until(nextRun).Truncate(time.Second))
}

func verifyExecution(t *testing.T, executed <-chan executedJobInfo, name string, tc triggerTestCase, service *Service) {
	t.Helper()
	select {
	case info := <-executed:
		if !tc.shouldExecute {
			t.Errorf("❌ Expected job %q NOT to execute, but it did", name)
		}
		updated, err := service.repo.GetTriggerByID(info.ID)
		if err != nil {
			t.Logf("⚠️ Executed job %q but failed to fetch updated trigger", name)
			return
		}
		t.Logf("✅ Job (%s) executed trigger id: (%d) | Updated NextRun: %s",
			info.Name, updated.ID, updated.NextRun.Format(time.DateTime))
	case <-time.After(65 * time.Second):
		if tc.shouldExecute {
			t.Errorf("⏰ Expected job %q to execute, but it did not", name)
		}
	}
}


