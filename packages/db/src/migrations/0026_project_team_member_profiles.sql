-- Additive management metadata. Existing actors and dates remain unknown.
ALTER TABLE project
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS documentation_url text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS updated_by text REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE team
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by text REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE team_member
  ADD COLUMN IF NOT EXISTS added_by text REFERENCES "user"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by text REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE member
  ADD COLUMN IF NOT EXISTS removal_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by text REFERENCES "user"(id) ON DELETE SET NULL;

DO $$ BEGIN
  ALTER TABLE project ADD CONSTRAINT project_purpose_length_check
    CHECK (purpose IS NULL OR length(purpose) <= 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE project ADD CONSTRAINT project_documentation_url_length_check
    CHECK (documentation_url IS NULL OR length(documentation_url) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE project ADD CONSTRAINT project_dates_order_check
    CHECK (start_date IS NULL OR target_date IS NULL OR target_date >= start_date);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE team ADD CONSTRAINT team_description_length_check
    CHECK (description IS NULL OR length(description) <= 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE team ADD CONSTRAINT team_purpose_length_check
    CHECK (purpose IS NULL OR length(purpose) <= 250);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE member ADD CONSTRAINT member_removal_reason_length_check
    CHECK (removal_reason IS NULL OR length(removal_reason) <= 250);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
