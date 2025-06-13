CREATE TABLE workflow_email (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    history_id BIGINT NOT NULL,
    execution_state TEXT NOT NULL CHECK (
        execution_state IN ('queued', 'paused', 'running', 'completed', 'failed')
    ),
    last_synced_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
