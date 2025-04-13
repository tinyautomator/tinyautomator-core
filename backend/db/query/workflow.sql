-- name: GetWorkflowNodes :many
SELECT id, workflow_id, name, type, category, service, config
FROM workflow_node
WHERE workflow_id = ?;

-- name: GetWorkflowEdges :many
SELECT workflow_id, source_node_id, target_node_id
FROM workflow_edge
WHERE workflow_id = ?;
