-- GetDueWorkflowSchedules is first implementation of getting due schedules, currently using locked one

-- name: GetDueWorkflowSchedules :many
SELECT *
FROM workflow_schedule
WHERE next_run_at IS NOT NULL
  AND next_run_at <= $1
  AND status = 'active';

-- name: UpdateWorkflowSchedule :exec
UPDATE workflow_schedule
SET next_run_at = $1,
    last_run_at = $2,
    updated_at = $3,
    execution_state = $4
WHERE id = $5;

-- name: CreateWorkflowSchedule :one
INSERT INTO workflow_schedule (
  workflow_id,
  schedule_type,
  next_run_at,
  last_run_at,
  execution_state,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, 'queued', $4, $5, $6)
RETURNING *;

-- name: DeleteWorkflowSchedule :exec
DELETE FROM workflow_schedule
WHERE id = $1;

-- name: GetDueSchedulesLocked :many
WITH locked AS (
  SELECT id
  FROM workflow_schedule
  WHERE execution_state = 'queued'
    AND next_run_at IS NOT NULL
    AND next_run_at <=  extract(epoch from now()) * 1000
  FOR UPDATE SKIP LOCKED
  LIMIT $1
)
UPDATE workflow_schedule
SET status = 'running'
FROM locked
WHERE workflow_schedule.id = locked.id
RETURNING *;
