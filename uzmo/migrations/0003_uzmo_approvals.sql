-- Durable UZMO human approval lifecycle.
CREATE TABLE IF NOT EXISTS uzmo_approvals (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  goal TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  job_id TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_approvals_org_status ON uzmo_approvals(org_id,status);
CREATE INDEX IF NOT EXISTS idx_uzmo_approvals_expiry ON uzmo_approvals(status,expires_at);