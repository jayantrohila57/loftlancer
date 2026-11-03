-- Sidebar Favorites: per-user pinned projects.
-- Review and apply on Neon dev first; do NOT auto-apply to production.
CREATE TABLE IF NOT EXISTS project_pin (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);
CREATE INDEX IF NOT EXISTS project_pin_user_idx ON project_pin (user_id, created_at);
