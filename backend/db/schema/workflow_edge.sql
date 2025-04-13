CREATE TABLE workflow_edge (
    workflow_id INTEGER NOT NULL,
    source_node_id INTEGER NOT NULL,
    target_node_id INTEGER NOT NULL,
    PRIMARY KEY (workflow_id, source_node_id, target_node_id),
    FOREIGN KEY (workflow_id) REFERENCES workflow(id) ON DELETE CASCADE,
    FOREIGN KEY (source_node_id) REFERENCES workflow_node(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES workflow_node(id) ON DELETE CASCADE
);
