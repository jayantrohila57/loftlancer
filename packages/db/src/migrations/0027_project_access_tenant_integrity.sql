-- Issue #586: access links must not cross organization boundaries. Report
-- inconsistent rows before creating constraints; never silently reassign them.
DO $$
DECLARE
  mismatch_count bigint;
  mismatch_ids text;
BEGIN
  WITH mismatches AS (
    SELECT pm.id
      FROM project_manager pm
      LEFT JOIN project p ON p.id = pm.project_id
     WHERE p.id IS NULL OR p.organization_id IS DISTINCT FROM pm.organization_id
  )
  SELECT count(*), (SELECT string_agg(id, ', ' ORDER BY id)
                      FROM (SELECT id FROM mismatches ORDER BY id LIMIT 10) sample)
    INTO mismatch_count, mismatch_ids
    FROM mismatches;
  IF mismatch_count > 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'Cannot add project access tenant constraints: project_manager has mismatched project/organization links',
      DETAIL = format('Sample row IDs: %s', mismatch_ids);
  END IF;

  WITH mismatches AS (
    SELECT pt.id
      FROM project_team pt
      LEFT JOIN project p ON p.id = pt.project_id
      LEFT JOIN team t ON t.id = pt.team_id
     WHERE p.id IS NULL
        OR p.organization_id IS DISTINCT FROM pt.organization_id
        OR t.id IS NULL
        OR t.organization_id IS DISTINCT FROM pt.organization_id
  )
  SELECT count(*), (SELECT string_agg(id, ', ' ORDER BY id)
                      FROM (SELECT id FROM mismatches ORDER BY id LIMIT 10) sample)
    INTO mismatch_count, mismatch_ids
    FROM mismatches;
  IF mismatch_count > 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'Cannot add project access tenant constraints: project_team has mismatched project/team/organization links',
      DETAIL = format('Sample row IDs: %s', mismatch_ids);
  END IF;

  WITH mismatches AS (
    SELECT pg.id
      FROM project_member_grant pg
      LEFT JOIN project p ON p.id = pg.project_id
     WHERE p.id IS NULL OR p.organization_id IS DISTINCT FROM pg.organization_id
  )
  SELECT count(*), (SELECT string_agg(id, ', ' ORDER BY id)
                      FROM (SELECT id FROM mismatches ORDER BY id LIMIT 10) sample)
    INTO mismatch_count, mismatch_ids
    FROM mismatches;
  IF mismatch_count > 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'Cannot add project access tenant constraints: project_member_grant has mismatched project/organization links',
      DETAIL = format('Sample row IDs: %s', mismatch_ids);
  END IF;
END $$;

-- Composite targets let PostgreSQL enforce tenant scope for direct SQL writers.
CREATE UNIQUE INDEX project_id_organization_id_uidx
  ON project (id, organization_id);

CREATE INDEX project_manager_org_project_user_idx
  ON project_manager (organization_id, project_id, user_id);
CREATE INDEX project_team_org_project_team_idx
  ON project_team (organization_id, project_id, team_id);
CREATE INDEX project_member_grant_org_project_user_idx
  ON project_member_grant (organization_id, project_id, user_id);

ALTER TABLE project_manager
  ADD CONSTRAINT project_manager_project_org_fk
  FOREIGN KEY (project_id, organization_id)
  REFERENCES project (id, organization_id)
  ON DELETE CASCADE;

ALTER TABLE project_team
  ADD CONSTRAINT project_team_project_org_fk
  FOREIGN KEY (project_id, organization_id)
  REFERENCES project (id, organization_id)
  ON DELETE CASCADE;

ALTER TABLE project_team
  ADD CONSTRAINT project_team_team_org_fk
  FOREIGN KEY (team_id, organization_id)
  REFERENCES team (id, organization_id)
  ON DELETE CASCADE;

ALTER TABLE project_member_grant
  ADD CONSTRAINT project_member_grant_project_org_fk
  FOREIGN KEY (project_id, organization_id)
  REFERENCES project (id, organization_id)
  ON DELETE CASCADE;
