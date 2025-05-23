CREATE TABLE workflow_run (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  finished_at BIGINT,
  created_at BIGINT NOT NULL
);
