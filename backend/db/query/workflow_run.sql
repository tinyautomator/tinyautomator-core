-- name: CreateWorkflowRun :one
INSERT INTO workflow_run (
  workflow_id, status, started_at, created_at, updated_at
) VALUES (
  $1, 'running', $2, $3, $4
)
RETURNING *;

-- name: CompleteWorkflowRun :exec
UPDATE workflow_run
SET status = $2,
    finished_at = $3
WHERE id = $1;

-- name: ListWorkflowRuns :many
SELECT *
FROM workflow_run
WHERE workflow_id = $1
ORDER BY started_at DESC
LIMIT 25;

-- name: GetWorkflowRun :one
SELECT * FROM workflow_run
WHERE id = $1;
