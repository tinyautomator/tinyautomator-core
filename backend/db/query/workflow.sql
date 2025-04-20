-- name: GetWorkflow :one
SELECT *
FROM workflow
WHERE id = ?;

-- name: CreateWorkflow :one
INSERT INTO workflow (
  user_id,
  name,
  description,
  created_at,
  updated_at
)
VALUES (
  ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
WHERE workflow_id = ?;

-- name: GetWorkflowEdges :many
SELECT workflow_id,
  source_node_id,
  target_node_id
FROM workflow_edge
WHERE workflow_id = ?;

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
  ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreateWorkflowNodeUi :one
INSERT INTO workflow_node_ui (
  id,
  workflow_id,
  x_position,
  y_position,
  node_label,
  node_type
)
VALUES (
  ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreateWorkflowEdge :one
INSERT INTO workflow_edge (
  workflow_id,
  source_node_id,
  target_node_id
)
VALUES (
  ?, ?, ?
)
RETURNING *;
