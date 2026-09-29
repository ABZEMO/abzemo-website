-- UZMO scheduler reliability migration.
-- Apply once to the UZMO D1 database before enabling durable scheduled workflows.
ALTER TABLE uzmo_workflows ADD COLUMN next_run_at TEXT;
ALTER TABLE uzmo_jobs ADD COLUMN schedule_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_uzmo_jobs_schedule_key ON uzmo_jobs(schedule_key);
CREATE INDEX IF NOT EXISTS idx_uzmo_workflows_due ON uzmo_workflows(enabled,next_run_at);
