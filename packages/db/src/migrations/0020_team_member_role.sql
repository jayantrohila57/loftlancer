ALTER TABLE "team_member"
  ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'member';

DO $$ BEGIN
  ALTER TABLE "team_member"
    ADD CONSTRAINT "team_member_role_check"
    CHECK ("role" IN ('lead', 'member'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;
