CREATE TABLE workflow_node_ui (
    id INTEGER PRIMARY KEY,
    workflow_id INTEGER NOT NULL,
    x_position REAL NOT NULL,
    y_position REAL NOT NULL,
    node_label TEXT,
    node_type TEXT NOT NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflow(id) ON DELETE CASCADE,
    FOREIGN KEY (id) REFERENCES workflow_node(id) ON DELETE CASCADE
);
