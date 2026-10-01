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
