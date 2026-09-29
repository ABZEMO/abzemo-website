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
