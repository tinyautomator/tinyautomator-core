-- name: CreateWorkflowCalendar :one
INSERT INTO workflow_calendar (
    workflow_id,
    config,
    sync_token,
    execution_state,
    last_synced_at,
    created_at,
    updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateWorkflowCalendar :exec
UPDATE workflow_calendar
SET config = $2,
    sync_token = $3,
    execution_state = $4,
    last_synced_at = $5,
    updated_at = $6
WHERE workflow_id = $1;

-- name: GetActiveWorkflowCalendarsLocked :many
WITH locked AS (
  SELECT
    wc.id,
    w.user_id
  FROM workflow_calendar wc
  INNER JOIN workflow w ON wc.workflow_id = w.id
  WHERE wc.execution_state = 'queued'
    AND wc.last_synced_at IS NOT NULL
  FOR UPDATE OF wc SKIP LOCKED
  LIMIT $1
)
UPDATE workflow_calendar
SET execution_state = 'running'
FROM locked
WHERE workflow_calendar.id = locked.id
RETURNING workflow_calendar.*, locked.user_id;
