CREATE TABLE IF NOT EXISTS uzmo_jobs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  input_json TEXT NOT NULL,
  scheduled_for TEXT,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  result_json TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_status_created
  ON uzmo_jobs (status, created_at);

CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_workflow
  ON uzmo_jobs (workflow_id);
