CREATE TABLE IF NOT EXISTS organization_domain (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  hostname text NOT NULL,
  purpose text NOT NULL DEFAULT 'email' CHECK (purpose IN ('email', 'workspace')),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'verified', 'active', 'failed', 'revoked')),
  verification_token_hash text NOT NULL,
  challenge_expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_domain_org_idx
  ON organization_domain (organization_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS organization_domain_active_hostname_uidx
  ON organization_domain (hostname, purpose)
  WHERE state IN ('pending', 'verified', 'active');
