CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  cover_image_key TEXT,
  category TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
ON posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_updated_at
ON posts (updated_at DESC);

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_at
ON media_assets (uploaded_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  actor_email TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
ON audit_events (created_at DESC);
