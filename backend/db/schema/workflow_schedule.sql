CREATE TABLE workflow_schedule (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (
        schedule_type IN ('once', 'daily', 'weekly', 'monthly')
    ),
    next_run_at BIGINT,
    last_run_at BIGINT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'pending', 'paused', 'completed')
    ),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
