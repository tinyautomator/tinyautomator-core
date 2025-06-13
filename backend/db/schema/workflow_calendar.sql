CREATE TABLE workflow_calendar (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    sync_token TEXT NOT NULL,
    execution_state TEXT NOT NULL CHECK (
        execution_state IN ('queued', 'paused', 'running', 'completed', 'failed')
    ),
    last_synced_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
