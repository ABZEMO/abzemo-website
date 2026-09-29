CREATE TABLE IF NOT EXISTS uzmo_memory (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  org_id TEXT,
  kind TEXT NOT NULL DEFAULT 'memory',
  content TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_memory_user ON uzmo_memory(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_uzmo_memory_org ON uzmo_memory(org_id, created_at);
