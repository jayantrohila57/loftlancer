-- Typed organization profile and lifecycle metadata.
-- Existing organization identity and metadata remain unchanged.
ALTER TABLE "organization"
  ADD COLUMN IF NOT EXISTS created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by text REFERENCES "user"(id) ON DELETE SET NULL;

-- Attribute only organizations with a recorded successful creation event.
WITH creators AS (
  SELECT DISTINCT ON (organization_id)
    organization_id,
    actor_user_id
  FROM audit_event
  WHERE action = 'organization.create'
    AND result = 'success'
    AND organization_id IS NOT NULL
  ORDER BY organization_id, created_at ASC
)
UPDATE "organization" AS org
SET created_by = creators.actor_user_id
FROM creators
WHERE org.id = creators.organization_id
  AND org.created_by IS NULL;

CREATE TABLE IF NOT EXISTS organization_profile (
  organization_id text PRIMARY KEY REFERENCES "organization"(id) ON DELETE CASCADE,
  description text,
  legal_name text,
  website_url text,
  industry text,
  size_band text,
  founded_year integer,
  contact_email text,
  contact_phone text,
  support_url text,
  country_code text,
  region text,
  city text,
  postal_code text,
  address_line_1 text,
  address_line_2 text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT organization_profile_size_band_check
    CHECK (size_band IS NULL OR size_band IN ('1-10', '11-50', '51-200', '201-1000', '1001+')),
  CONSTRAINT organization_profile_country_code_check
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT organization_profile_founded_year_check
    CHECK (founded_year IS NULL OR founded_year BETWEEN 1000 AND 9999)
);

CREATE INDEX IF NOT EXISTS organization_archived_at_idx
  ON "organization" (archived_at)
  WHERE deleted_at IS NULL;
