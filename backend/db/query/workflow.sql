-- name: GetWorkflow :one
SELECT *
FROM workflow
WHERE id = $1;

-- name: GetUserWorkflows :many
SELECT *
FROM workflow
WHERE user_id = $1;

-- name: CreateWorkflow :one
INSERT INTO workflow (
  user_id,
  name,
  description,
  status,
  created_at,
  updated_at
)
VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: GetChildNodeIDs :many
SELECT target_node_id
FROM workflow_edge
WHERE source_node_id = $1;

-- name: CreateWorkflowNode :one
INSERT INTO workflow_node (
  workflow_id,
  action_type,
  config
)
VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: CreateWorkflowNodeUi :one
INSERT INTO workflow_node_ui (
  id,
  x_position,
  y_position
)
VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: CreateWorkflowEdge :one
INSERT INTO workflow_edge (
  workflow_id,
  source_node_id,
  target_node_id
)
VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: GetWorkflowGraph :many
SELECT
  w.id AS workflow_id,
  w.name AS workflow_name,
  w.description AS workflow_description,
  w.status AS workflow_status,
  w.created_at,
  wn.id AS node_id,
  action_type,
  config,
  source_node_id,
  target_node_id
FROM workflow w
INNER JOIN workflow_node wn ON w.id = wn.workflow_id
LEFT JOIN workflow_edge we ON w.id = we.workflow_id
  AND we.source_node_id = wn.id
WHERE w.id = $1;

-- name: RenderWorkflowGraph :many
SELECT
  w.id AS workflow_id,
  w.name AS workflow_name,
  w.description AS workflow_description,
  w.status AS workflow_status,
  w.created_at,
  wn.id AS node_id,
  wnu.x_position,
  wnu.y_position,
  action_type,
  config,
  source_node_id,
  target_node_id
FROM workflow w
INNER JOIN workflow_node wn ON w.id = wn.workflow_id
INNER JOIN workflow_node_ui wnu ON wn.id = wnu.id
LEFT JOIN workflow_edge we ON w.id = we.workflow_id
  AND we.source_node_id = wn.id
WHERE w.id = $1;

-- name: UpdateWorkflow :exec
UPDATE workflow
SET name = $2,
    description = $3,
    updated_at = $4
WHERE id = $1;

-- name: UpdateWorkflowNode :exec
UPDATE workflow_node
SET action_type = $2,
    config = $3
WHERE id = $1;

-- name: UpdateWorkflowNodeUI :exec
UPDATE workflow_node_ui
SET x_position = $2,
    y_position = $3
WHERE id = $1;

-- name: DeleteWorkflowNode :exec
DELETE FROM workflow_node
WHERE id = $1;

-- name: DeleteWorkflowEdge :exec
DELETE FROM workflow_edge
WHERE workflow_id = $1
  AND source_node_id = $2
  AND target_node_id = $3;
