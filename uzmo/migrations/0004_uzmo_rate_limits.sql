CREATE TABLE IF NOT EXISTS uzmo_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  bucket_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uzmo_rate_limits_updated ON uzmo_rate_limits(updated_at);