-- name: GetWorkflow :one
SELECT * FROM workflow
WHERE id = ?;

-- name: CreateWorkflow :one
INSERT INTO workflow (
  name,
  description,
  created_at,
  updated_at
)
VALUES (
  ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetWorkflowNodes :many
SELECT id, workflow_id, name, type, category, service, config
FROM workflow_node
WHERE workflow_id = ?;

-- name: GetWorkflowEdges :many
SELECT workflow_id, source_node_id, target_node_id
FROM workflow_edge
WHERE workflow_id = ?;
