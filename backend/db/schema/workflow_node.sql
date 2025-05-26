CREATE TABLE workflow_node (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('trigger', 'action')),
    node_type TEXT NOT NULL,
    config JSONB NOT NULL
);
