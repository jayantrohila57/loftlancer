-- Project slugs are unique per organization, not globally (#301).
-- URLs are /[org]/[project], so two orgs may both have "web".
CREATE UNIQUE INDEX IF NOT EXISTS project_org_slug_active_uidx
  ON project (organization_id, slug)
  WHERE deleted_at IS NULL;
DROP INDEX IF EXISTS project_slug_active_uidx;
