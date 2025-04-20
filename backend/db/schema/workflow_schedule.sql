CREATE TABLE workflow_schedule (
    id TEXT PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (
        schedule_type IN ('once', 'daily', 'weekly', 'monthly')
    ),
    next_run_at INTEGER,
    last_run_at INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'paused', 'completed')
    ),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
