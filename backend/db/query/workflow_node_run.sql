-- name: CreateWorkflowNodeRun :one
INSERT INTO workflow_node_run (
  workflow_run_id,
  workflow_node_id,
  status,
  metadata
)
VALUES ($1, $2, 'pending', $3)
ON CONFLICT (workflow_run_id, workflow_node_id) DO NOTHING
RETURNING *;

-- name: GetWorkflowNodeRunByWorkflowRunIDAndNodeID :one
SELECT *
FROM workflow_node_run
WHERE workflow_run_id = $1
  AND workflow_node_id = $2;

-- name: GetParentWorkflowNodeRuns :many
SELECT wnr.*
FROM workflow_node_run wnr
INNER JOIN workflow_edge we ON wnr.workflow_node_id = we.source_node_id
WHERE workflow_run_id = $1
AND target_node_id = $2;

-- name: GetChildWorkflowNodeRuns :many
SELECT wnr.*
FROM workflow_node_run wnr
INNER JOIN workflow_edge we ON wnr.workflow_node_id = we.source_node_id
WHERE workflow_run_id = $1
AND source_node_id = $2;

-- name: GetWorkflowNodeRunsByRunID :many
SELECT *
FROM workflow_node_run
WHERE workflow_run_id = $1
ORDER BY started_at ASC;

-- name: MarkWorkflowNodeAsRunning :exec
UPDATE workflow_node_run
SET status = 'running',
    started_at = $2,
    retry_count = $3
WHERE id = $1;

-- name: UpdateWorkflowNodeRun :exec
UPDATE workflow_node_run
SET status = $2,
    finished_at = $3,
    metadata = $4,
    error_message = $5
WHERE id = $1;
