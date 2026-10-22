CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id text PRIMARY KEY REFERENCES "organization"(id) ON DELETE CASCADE,
  time_zone text NOT NULL DEFAULT 'UTC',
  locale text NOT NULL DEFAULT 'en',
  date_format text NOT NULL DEFAULT 'medium' CHECK (date_format IN ('short', 'medium', 'long')),
  time_format text NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  week_start integer NOT NULL DEFAULT 1 CHECK (week_start BETWEEN 0 AND 6),
  display_currency text NOT NULL DEFAULT 'USD' CHECK (display_currency ~ '^[A-Z]{3}$'),
  default_project_visibility text NOT NULL DEFAULT 'private' CHECK (default_project_visibility IN ('private', 'public')),
  notification_defaults jsonb NOT NULL DEFAULT '{"email":true,"inApp":true,"version":1}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS organization_entitlement (
  organization_id text NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  "limit" integer CHECK ("limit" IS NULL OR "limit" >= 0),
  source text NOT NULL DEFAULT 'product_default',
  reference text,
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  PRIMARY KEY (organization_id, feature_key)
);
