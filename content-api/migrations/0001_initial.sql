CREATE TABLE IF NOT EXISTS content_entries (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog', 'paper', 'certificate', 'demo')),
  title TEXT NOT NULL,
  data_json TEXT NOT NULL CHECK (json_valid(data_json)),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS content_entries_public_lookup
  ON content_entries (type, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS owner_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS owner_sessions_expiry
  ON owner_sessions (expires_at);
