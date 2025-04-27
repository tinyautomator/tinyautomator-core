CREATE TABLE workflow_node (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    config JSONB NOT NULL
);
