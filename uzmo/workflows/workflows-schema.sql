CREATE TABLE IF NOT EXISTS uzmo_workflows (
 id TEXT PRIMARY KEY, org_id TEXT NOT NULL, name TEXT NOT NULL,
 trigger_json TEXT NOT NULL DEFAULT '{}', steps_json TEXT NOT NULL DEFAULT '[]',
 approval_json TEXT, enabled INTEGER NOT NULL DEFAULT 1, version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_workflows_org ON uzmo_workflows(org_id);
