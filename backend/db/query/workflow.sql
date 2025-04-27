-- name: GetWorkflow :one
SELECT *
FROM workflow
WHERE id = $1;

-- name: CreateWorkflow :one
INSERT INTO workflow (
  user_id,
  name,
  description,
  created_at,
  updated_at
)
VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetWorkflowNodes :many
SELECT id,
  workflow_id,
  action_type,
  config
FROM workflow_node
WHERE workflow_id = $1;

-- name: GetWorkflowEdges :many
SELECT workflow_id,
  source_node_id,
  target_node_id
FROM workflow_edge
WHERE workflow_id = $1;

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
  y_position,
  node_label,
  node_type
)
VALUES (
  $1, $2, $3, $4, $5
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
