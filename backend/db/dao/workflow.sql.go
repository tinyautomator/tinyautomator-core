// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: workflow.sql

package dao

import (
	"context"
)

const getWorkflowEdges = `-- name: GetWorkflowEdges :many
SELECT workflow_id, source_node_id, target_node_id
FROM workflow_edge
WHERE workflow_id = ?
`

// GetWorkflowEdges
//
//	SELECT workflow_id, source_node_id, target_node_id
//	FROM workflow_edge
//	WHERE workflow_id = ?
func (q *Queries) GetWorkflowEdges(ctx context.Context, workflowID int64) ([]*WorkflowEdge, error) {
	rows, err := q.db.QueryContext(ctx, getWorkflowEdges, workflowID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*WorkflowEdge
	for rows.Next() {
		var i WorkflowEdge
		if err := rows.Scan(&i.WorkflowID, &i.SourceNodeID, &i.TargetNodeID); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkflowNodes = `-- name: GetWorkflowNodes :many
SELECT id, workflow_id, name, type, category, service, config
FROM workflow_node
WHERE workflow_id = ?
`

// GetWorkflowNodes
//
//	SELECT id, workflow_id, name, type, category, service, config
//	FROM workflow_node
//	WHERE workflow_id = ?
func (q *Queries) GetWorkflowNodes(ctx context.Context, workflowID int64) ([]*WorkflowNode, error) {
	rows, err := q.db.QueryContext(ctx, getWorkflowNodes, workflowID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*WorkflowNode
	for rows.Next() {
		var i WorkflowNode
		if err := rows.Scan(
			&i.ID,
			&i.WorkflowID,
			&i.Name,
			&i.Type,
			&i.Category,
			&i.Service,
			&i.Config,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
