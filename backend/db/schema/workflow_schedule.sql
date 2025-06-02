CREATE TABLE workflow_schedule (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (
        schedule_type IN ('once', 'daily', 'weekly', 'monthly')
    ),
    next_run_at BIGINT,
    last_run_at BIGINT,
    execution_state TEXT NOT NULL CHECK (
        execution_state IN ('queued', 'paused', 'running', 'completed', 'failed')
    ),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
