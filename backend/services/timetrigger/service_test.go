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

// --- Unit Tests ---
// Pure unit logic, no job scheduling or goroutines

// TestValidateTrigger checks that TimeTrigger validation logic correctly accepts or rejects triggers.
// It verifies constraints like:
// - correct combination of interval + dayOfWeek/dayOfMonth
// - valid time format for TriggerAt
// - supported action types
// - proper NextRun value set
func TestValidateTrigger(t *testing.T) {
	for name, tc := range getTriggerValidationCases() {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			err := ValidateTrigger(tc.trigger)
			assertValidation(t, err, tc.valid, name)
		})
	}
}

// TestComputeFirstRun verifies that the first scheduled run time
// is computed correctly based on the trigger interval, day, and time of day.
// This test is intended for new or unscheduled triggers with no LastRun value.
func TestComputeFirstRun(t *testing.T) {
	t.Logf("🧪 Unit Test — ComputeFirstRun Logic")
	t.Logf("🕒 Test Start Time: %s", time.Now().UTC().Format(time.DateTime))

	testCases := getComputeFirstRunTestCases()

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			actualRunTime, err := ComputeFirstRun(tc.Trigger)
			t.Logf("🔎 Trigger: Interval=%s | NextRun=%s | TriggerAt=%s",
			tc.Trigger.Interval,
			tc.Trigger.NextRun.Format(time.DateTime),
			tc.Trigger.TriggerAt,
			)

			t.Logf("✅ Expected: %s", tc.ExpectedRun.Format(time.DateTime))
			t.Logf("🧮 Computed: %s", actualRunTime.Format(time.DateTime))

			if tc.ExpectErr {
				require.Error(t, err, "expected an error but got none")
				return
			}

			require.NoError(t, err, "expected no error but got one")
			require.WithinDuration(t, tc.ExpectedRun, actualRunTime, time.Second,
				"expected run time %v but got %v", tc.ExpectedRun, actualRunTime)
		})
	}
}

// TestComputeNextRun verifies that the next run is scheduled correctly
// based on the trigger's LastRun and interval. This is used for recurring
// triggers that have already executed at least once.
func TestComputeNextRun(t *testing.T){
	t.Logf("🧪 Unit Test — ComputeNextRun Logic")
	t.Logf("🕒 Test Start Time: %s", time.Now().UTC().Format(time.DateTime))

	testCases := getComputeNextRunTestCases()

	service, err := NewService(timetrigger.NewInMemoryRepository())
	require.NoError(t, err)
	defer service.scheduler.Shutdown()


	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			err := service.computeNextRun(&tc.Trigger)
			if tc.ExpectErr {
				require.Error(t, err, "expected an error but got none")
				return
			}

			actualNextRun := tc.Trigger.NextRun
			t.Logf("🔎 Trigger ID=%d | Interval=%s | LastRun=%s | TriggerAt=%s",
			tc.Trigger.ID,
			tc.Trigger.Interval,
			tc.Trigger.LastRun.Format(time.DateTime),
			tc.Trigger.TriggerAt,
			)
		

			t.Logf("✅ Expected: %s", tc.ExpectedRun.Format(time.DateTime))
			t.Logf("🧮 Computed: %s", actualNextRun.Format(time.DateTime))

			require.NoError(t, err, "expected no error but got one")
			require.WithinDuration(t, tc.ExpectedRun, actualNextRun, time.Second,
				"expected next run time %v but got %v", tc.ExpectedRun, actualNextRun)
		})
	}
}

// --- Functional/Unit-Level Integration Tests ---
// These isolate components but still spin up schedulers

// This test uses a separate scheduler and repository for each test case.
// It ensures that each test case is isolated and does not interfere with others.
// This is useful for testing edge cases and ensuring that the scheduler behaves correctly in isolation.
// The test cases are run in parallel, which allows for faster execution.
func TestScheduleTrigger_Unit_TriggerValidation(t *testing.T) {
	t.Logf("🧪 Unit Test — Isolated Scheduler/Repo Per Case")
	t.Logf("🕒 Current Time: %s", time.Now().UTC().Format(time.DateTime))


	for name, tc := range getSchedulingTestCases() {

		t.Run(name, func(t *testing.T) {
			t.Parallel()

			executed := make(chan executedJobInfo, 1)
			service, err := NewService(timetrigger.NewInMemoryRepository())
			
			require.NoError(t, err)
			
			defer service.scheduler.Shutdown()

			tc.trigger = saveTrigger(t, service.repo, tc.trigger)

			resetTaskOverride()
			t.Cleanup(resetTaskOverride)

			if tc.valid && tc.shouldExecute {
				overrideTaskExecution(t, executed, name)
			}

			job, err := service.ScheduleTrigger(tc.trigger)

			assertValidation(t, err, tc.valid, name)
			if tc.valid {
				logNextRun(t, name, job, tc.trigger)
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

// --- Mixed or Scenario-Based Tests ---
// Broader coverage with shared state, testing multiple behaviors
func TestScheduleTrigger_MixedSchedulingBehavior(t *testing.T) {
	t.Logf("🌐 MixedSchedulingBehavior — Shared Scheduler + Shared Repo")
	t.Logf("🕒 Current Time: %s", time.Now().UTC().Format(time.DateTime))

	service, err := NewService(timetrigger.NewInMemoryRepository())
	
	require.NoError(t, err)
	
	defer service.scheduler.Shutdown()

	executed := make(chan executedJobInfo, 10)
	executionsExpected := 0

	for name, tc := range getSchedulingTestCases() {
		trigger, err := service.repo.SaveTrigger(tc.trigger)
		require.NoError(t, err, "Failed to save trigger %q", name)
		tc.trigger = trigger

		if tc.valid && tc.shouldExecute {
			overrideTaskExecution(t, executed, name)
		} else {
			resetTaskOverride()
		}

		job, err := service.ScheduleTrigger(tc.trigger)
		assertValidation(t, err, tc.valid, name)
		
		if err == nil && job != nil {
			logNextRun(t, name, job, tc.trigger)
		}
		

		if tc.shouldExecute {
			executionsExpected++
		}
	}

	timeout := time.After(executionTimeout)
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


func saveTrigger(t *testing.T, repo timetrigger.Repository, trigger models.TimeTrigger) models.TimeTrigger {
	t.Helper()
	saved, err := repo.SaveTrigger(trigger)
	require.NoError(t, err, "Failed to save trigger")
	return saved
}

func assertValidation(t *testing.T, err error, valid bool, name string) {
	t.Helper()
	if valid {
		require.NoError(t, err, "Expected valid for %q", name)
	} else {
		require.Error(t, err, "Expected error for invalid trigger %q", name)
	}
}

const executionTimeout = 65 * time.Second
