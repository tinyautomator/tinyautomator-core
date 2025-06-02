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
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: DeleteWorkflowSchedule :exec
DELETE FROM workflow_schedule
WHERE id = $1;

-- name: DeleteWorkflowScheduleByWorkflowID :exec
DELETE FROM workflow_schedule WHERE workflow_id = $1;

-- name: GetDueSchedulesLocked :many
WITH locked AS (
  SELECT
    ws.id,
    w.user_id
  FROM workflow_schedule ws
  INNER JOIN workflow w ON ws.workflow_id = w.id
  WHERE ws.execution_state = 'queued'
    AND ws.next_run_at IS NOT NULL
    AND ws.next_run_at <= extract(epoch from now()) * 1000
  FOR UPDATE OF ws SKIP LOCKED
  LIMIT $1
)
UPDATE workflow_schedule
SET execution_state = 'running'
FROM locked
WHERE workflow_schedule.id = locked.id
RETURNING workflow_schedule.*, locked.user_id;
