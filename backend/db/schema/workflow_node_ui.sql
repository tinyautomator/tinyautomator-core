CREATE TABLE workflow_node_ui (
    id INTEGER PRIMARY KEY,
    x_position DOUBLE PRECISION NOT NULL,
    y_position DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (id) REFERENCES workflow_node(id) ON DELETE CASCADE
);
