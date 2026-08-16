CREATE TABLE api_keys (
  api_key TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE INDEX api_keys_expires_at_idx ON api_keys (expires_at);

CREATE TABLE items (
  item_key TEXT PRIMARY KEY,
  api_key TEXT NOT NULL,
  value TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE INDEX items_api_key_idx ON items (api_key);
CREATE INDEX items_expires_at_idx ON items (expires_at);
CREATE INDEX items_created_at_idx ON items (created_at);

CREATE TABLE upload_limits (
  api_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (api_key, window_start)
) WITHOUT ROWID;

CREATE INDEX upload_limits_window_start_idx ON upload_limits (window_start);
