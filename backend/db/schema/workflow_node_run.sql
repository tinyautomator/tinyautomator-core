CREATE TABLE workflow_node_run (
  id SERIAL PRIMARY KEY,
  workflow_run_id INTEGER NOT NULL REFERENCES workflow_run(id) ON DELETE CASCADE,
  workflow_node_id INTEGER NOT NULL REFERENCES workflow_node(id),
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  started_at BIGINT NOT NULL,
  finished_at BIGINT,
  metadata JSONB,
  error_message TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,

  CONSTRAINT unique_node_per_run UNIQUE (workflow_run_id, workflow_node_id)
);
