-- UZMO consolidated D1 migration: run after auth, memory, jobs and workflow base schemas.
-- Safe to re-run.
CREATE TABLE IF NOT EXISTS uzmo_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uzmo_organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uzmo_memberships (
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL,
  PRIMARY KEY(user_id, org_id)
);
CREATE TABLE IF NOT EXISTS uzmo_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  org_id TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uzmo_audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  org_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS uzmo_jobs (
 id TEXT PRIMARY KEY, workflow_id TEXT NOT NULL, org_id TEXT,
 status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 input_json TEXT NOT NULL DEFAULT '{}', result_json TEXT, error TEXT,
 scheduled_for TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_org_status ON uzmo_jobs(org_id,status);
CREATE INDEX IF NOT EXISTS idx_uzmo_jobs_scheduled ON uzmo_jobs(scheduled_for);
\nALTER TABLE uzmo_jobs ADD COLUMN locked_by TEXT;\n

CREATE TABLE IF NOT EXISTS uzmo_workflows (
 id TEXT PRIMARY KEY, org_id TEXT NOT NULL, name TEXT NOT NULL,
 trigger_json TEXT NOT NULL DEFAULT '{}', steps_json TEXT NOT NULL DEFAULT '[]',
 approval_json TEXT, enabled INTEGER NOT NULL DEFAULT 1, version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_workflows_org ON uzmo_workflows(org_id);


CREATE TABLE IF NOT EXISTS uzmo_oauth_states (
  state TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_oauth_states_expiry ON uzmo_oauth_states(expires_at);

CREATE TABLE IF NOT EXISTS uzmo_oauth_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  access_token_enc TEXT NOT NULL,
  refresh_token_enc TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, org_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_uzmo_oauth_connections_org ON uzmo_oauth_connections(org_id, provider);
