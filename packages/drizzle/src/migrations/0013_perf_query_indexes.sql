-- Performance indexes for hot dashboard / timeline / permissions paths.
-- Review and apply on Neon dev first; do NOT auto-apply to production.

CREATE INDEX IF NOT EXISTS invitation_org_status_idx
  ON invitation (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS audit_event_action_created_idx
  ON audit_event (action, created_at DESC);

CREATE INDEX IF NOT EXISTS project_user_id_active_idx
  ON project (user_id)
  WHERE deleted_at IS NULL;
