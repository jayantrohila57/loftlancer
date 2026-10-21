ALTER TABLE member
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS invited_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS joined_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suspension_reason text;

UPDATE member SET joined_at = created_at WHERE joined_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS member_org_id_uidx ON member (organization_id, id);

DO $$ BEGIN
  ALTER TABLE member
    ADD CONSTRAINT member_suspension_reason_length_check
    CHECK (suspension_reason IS NULL OR length(suspension_reason) <= 250);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Invitations may only reference a team in the same organization. Fail the
-- migration with actionable data rather than silently widening or rewriting scope.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM invitation i
    LEFT JOIN team t ON t.id = i.team_id
    WHERE i.team_id IS NOT NULL
      AND (t.id IS NULL OR t.organization_id <> i.organization_id)
  ) THEN
    RAISE EXCEPTION 'Cannot add organization-scoped invitation team constraint: resolve invalid invitation.team_id references first';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS team_id_organization_id_uidx
  ON team (id, organization_id);

DO $$ BEGIN
  ALTER TABLE invitation
    ADD CONSTRAINT invitation_team_id_team_id_fk
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE invitation
    ADD CONSTRAINT invitation_team_same_org_fk
    FOREIGN KEY (team_id, organization_id)
    REFERENCES team (id, organization_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE invitation
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS revoked_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS organization_role (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS organization_role_permission (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES organization_role(id) ON DELETE CASCADE,
  action_name text NOT NULL,
  UNIQUE (role_id, action_name)
);
CREATE UNIQUE INDEX IF NOT EXISTS organization_role_org_id_uidx ON organization_role (organization_id, id);

CREATE TABLE IF NOT EXISTS member_organization_role (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  member_id text NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES organization_role(id) ON DELETE CASCADE,
  assigned_by text REFERENCES "user"(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, member_id)
);

CREATE INDEX IF NOT EXISTS organization_role_permission_org_role_idx
  ON organization_role_permission (organization_id, role_id);

DO $$ BEGIN
  ALTER TABLE organization_role_permission
    ADD CONSTRAINT organization_role_permission_same_org_fk
    FOREIGN KEY (organization_id, role_id)
    REFERENCES organization_role (organization_id, id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE member_organization_role
    ADD CONSTRAINT member_organization_role_same_org_member_fk
    FOREIGN KEY (organization_id, member_id)
    REFERENCES member (organization_id, id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE member_organization_role
    ADD CONSTRAINT member_organization_role_same_org_role_fk
    FOREIGN KEY (organization_id, role_id)
    REFERENCES organization_role (organization_id, id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
