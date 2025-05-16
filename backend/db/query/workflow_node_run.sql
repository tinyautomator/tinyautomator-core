-- name: CreateWorkflowNodeRun :one
INSERT INTO workflow_node_run (
  workflow_run_id, workflow_node_id, status, started_at, metadata, created_at, updated_at
) VALUES (
  $1, $2, 'running', $3, $4, $5, $6
)
RETURNING *;

-- name: CompleteWorkflowNodeRun :exec
UPDATE workflow_node_run
SET status = $2,
    finished_at = $3,
    metadata = $4,
    error_message = $5
WHERE id = $1;

-- name: GetWorkflowNodeRunsByRunID :many
SELECT *
FROM workflow_node_run
WHERE workflow_run_id = $1
ORDER BY started_at ASC;
