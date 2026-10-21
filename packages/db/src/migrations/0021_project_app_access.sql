-- App grants are always evaluated inside the active project access boundary.
-- Existing installs keep inherited project access with the default mode.
ALTER TABLE project_app
  ADD COLUMN IF NOT EXISTS access_mode text NOT NULL DEFAULT 'inherited';

DO $$ BEGIN
  ALTER TABLE project_app
    ADD CONSTRAINT project_app_access_mode_check
    CHECK (access_mode IN ('inherited', 'restricted'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS project_app_access (
  id text PRIMARY KEY,
  project_app_id text NOT NULL REFERENCES project_app(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  team_id text REFERENCES team(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by text REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT project_app_access_subject_check CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS project_app_access_project_idx
  ON project_app_access (project_id, project_app_id);
CREATE UNIQUE INDEX IF NOT EXISTS project_app_access_user_uq
  ON project_app_access (project_app_id, user_id)
  WHERE user_id IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS project_app_access_team_uq
  ON project_app_access (project_app_id, team_id)
  WHERE team_id IS NOT NULL AND deleted_at IS NULL;
