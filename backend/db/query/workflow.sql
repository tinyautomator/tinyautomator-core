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
RETURNING id, user_id, name, description, is_active, created_at, updated_at;

-- name: GetWorkflowNodes :many
SELECT id,
  workflow_id,
  name,
  type,
  category,
  service,
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
  name,
  type,
  category,
  service,
  config
)
VALUES (
  $1, $2, $3, $4, $5, $6
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
