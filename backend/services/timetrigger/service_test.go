package timetrigger

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
)

// --- Unit Tests ---
// Pure unit logic, no job scheduling or goroutines

// TestValidateTrigger checks that TimeTrigger validation logic correctly accepts or rejects triggers.
// It verifies constraints like:
// - correct combination of interval + dayOfWeek/dayOfMonth
// - valid time format for TriggerAt
// - supported action types
// - proper NextRun value set
func TestValidateTrigger(t *testing.T) {
	service, err := NewService(timetrigger.NewInMemoryRepository())

	require.NoError(t, err)

	for name, tc := range getTriggerValidationCases() {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			err := service.ValidateTrigger(tc.trigger)
			assertValidation(t, err, tc.valid, name)
		})
	}

	service.Shutdown()
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
func TestComputeNextRun(t *testing.T) {
	t.Logf("🧪 Unit Test — ComputeNextRun Logic")
	t.Logf("🕒 Test Start Time: %s", time.Now().UTC().Format(time.DateTime))

	testCases := getComputeNextRunTestCases()

	service, err := NewService(timetrigger.NewInMemoryRepository())
	require.NoError(t, err)

	defer func() {
		if err := service.scheduler.Shutdown(); err != nil {
			panic(err)
		}
	}()

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
func TestScheduleTrigger_SchedulesValidTriggersInScheduler(t *testing.T) {
	t.Logf("🧪 Unit Test — Isolated Scheduler/Repo Per Case")
	t.Logf("🕒 Current Time: %s", time.Now().UTC().Format(time.DateTime))

	for name, tc := range getSchedulingTestCases() {

		t.Run(name, func(t *testing.T) {
			t.Parallel()
			t.Logf("🔎 Case: %s | Interval=%s | TriggerAt=%s", name, tc.trigger.Interval, tc.trigger.TriggerAt)

			repo := timetrigger.NewInMemoryRepository()
			service, err := NewService(repo)
			require.NoError(t, err)

			service.Start()

			defer service.Shutdown()

			tc.trigger = saveTrigger(t, service.repo, tc.trigger)

			job, err := service.ScheduleTrigger(tc.trigger)

			if tc.valid {
				require.NotNil(t, job, "expected job to be returned for valid trigger")

				time.Sleep(10 * time.Millisecond)
				nextRun, err := job.NextRun()
				require.NoError(t, err, "NextRun should be available for valid scheduled job")

				t.Logf("✅ Job scheduled: ID=%d | TriggerAt=%s | Scheduler NextRun=%s",
					tc.trigger.ID, tc.trigger.TriggerAt, nextRun.Format(time.DateTime))

				require.WithinDuration(t, tc.trigger.NextRun, nextRun, time.Minute,
					"Expected NextRun from scheduler to match trigger config")
			} else {
				require.Error(t, err, "expected an error for invalid trigger")
				require.Nil(t, job, "expected job to be nil for invalid trigger")
			}
		})
	}
}

// --- Helpers ---
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
