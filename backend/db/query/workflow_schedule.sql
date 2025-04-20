-- name: GetDueWorkflowSchedules :many
SELECT *
FROM workflow_schedule
WHERE next_run_at IS NOT NULL
    AND next_run_at <= ?
    AND status = 'active';

-- name: UpdateScheduleTimes :exec
UPDATE workflow_schedule
SET next_run_at = ?,
    last_run_at = ?,
    updated_at = ?
WHERE id = ?;

-- name: CreateWorkflowSchedule :one
INSERT INTO workflow_schedule (
        id,
        workflow_id,
        schedule_type,
        next_run_at,
        last_run_at,
        status,
        created_at,
        updated_at
    )
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: DeleteWorkflowSchedule :exec
DELETE FROM workflow_schedule
WHERE id = ?;
