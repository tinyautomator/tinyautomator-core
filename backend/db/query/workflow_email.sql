-- name: CreateWorkflowEmail :one
INSERT INTO workflow_email (
    workflow_id,
    config,
    history_id,
    execution_state,
    last_synced_at,
    created_at,
    updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateWorkflowEmail :exec
UPDATE workflow_email
SET config = $2,
    history_id = $3,
    execution_state = $4,
    last_synced_at = $5,
    updated_at = $6
WHERE workflow_id = $1;

-- name: GetActiveWorkflowEmailsLocked :many
WITH locked AS (
  SELECT
    we.id,
    w.user_id
  FROM workflow_email we
  INNER JOIN workflow w ON we.workflow_id = w.id
  WHERE we.execution_state = 'queued'
    AND we.last_synced_at IS NOT NULL
  FOR UPDATE OF we SKIP LOCKED
  LIMIT $1
)
UPDATE workflow_email
SET execution_state = 'running'
FROM locked
WHERE workflow_email.id = locked.id
RETURNING workflow_email.*, locked.user_id;
