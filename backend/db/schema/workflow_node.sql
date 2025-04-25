CREATE TABLE workflow_node (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    name TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    service TEXT,
    config TEXT NOT NULL
);
