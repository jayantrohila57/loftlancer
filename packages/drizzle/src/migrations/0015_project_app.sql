-- Apps system foundation (#245): per-project app installations.
CREATE TABLE IF NOT EXISTS project_app (
  id text PRIMARY KEY,
  organization_id text REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  app_id text NOT NULL,
  app_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  installed_by text REFERENCES "user"(id) ON DELETE SET NULL,
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  uninstalled_by text REFERENCES "user"(id) ON DELETE SET NULL,
  uninstalled_at timestamptz,
  purge_after timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS project_app_project_app_uq ON project_app (project_id, app_id);
CREATE INDEX IF NOT EXISTS project_app_project_status_idx ON project_app (project_id, status);

-- Existing projects keep env so nothing breaks (incl. soft-deleted, so restore works).
INSERT INTO project_app (id, organization_id, project_id, app_id, app_version, status, installed_by)
SELECT gen_random_uuid()::text, p.organization_id, p.id, 'env', 1, 'active', p.user_id
FROM project p
ON CONFLICT (project_id, app_id) DO NOTHING;
