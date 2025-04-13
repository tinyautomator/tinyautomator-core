CREATE TABLE workflow_node (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER NOT NULL,
    name TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    service TEXT,
    config TEXT NOT NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflow(id) ON DELETE CASCADE
);
