-- name: CreateWorkflowRun :one
INSERT INTO workflow_run (
  workflow_id, status, created_at
) VALUES (
  $1, 'running', $2
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
ORDER BY created_at DESC
LIMIT 25;

-- name: GetWorkflowRunWithNodeRuns :many
SELECT
  wr.id AS workflow_run_id,
  wr.workflow_id,
  wr.status AS workflow_run_status,
  wr.finished_at AS workflow_run_finished_at,
  wr.created_at AS workflow_run_created_at,
  wnr.id AS node_run_id,
  wnr.workflow_node_id,
  wnr.status AS node_run_status,
  wnr.started_at AS node_run_started_at,
  wnr.finished_at AS node_run_finished_at,
  wnr.metadata,
  wnr.error_message
FROM workflow_run wr
INNER JOIN workflow_node_run wnr ON wr.id = wnr.workflow_run_id
WHERE wr.id = $1;
