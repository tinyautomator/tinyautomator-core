CREATE TABLE workflow_node_run (
  id SERIAL PRIMARY KEY,
  workflow_run_id INTEGER NOT NULL REFERENCES workflow_run(id) ON DELETE CASCADE,
  workflow_node_id INTEGER NOT NULL REFERENCES workflow_node(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  started_at BIGINT,
  finished_at BIGINT,
  metadata JSONB,
  error_message TEXT,

  CONSTRAINT unique_node_per_run UNIQUE (workflow_run_id, workflow_node_id)
);
