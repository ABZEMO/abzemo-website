CREATE TABLE IF NOT EXISTS uzmo_jobs (
 id TEXT PRIMARY KEY,
 workflow_id TEXT NOT NULL,
 status TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 input_json TEXT NOT NULL DEFAULT '{}',
 result_json TEXT,
 error TEXT,
 scheduled_for TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_status ON uzmo_jobs(status);
CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_scheduled ON uzmo_jobs(scheduled_for);
