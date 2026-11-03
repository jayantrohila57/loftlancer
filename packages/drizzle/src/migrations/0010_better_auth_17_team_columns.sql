-- Better Auth 1.7 organization plugin (teams enabled). Apply after 0009_platform_apps.
-- Do NOT run on production until reviewed on a Neon branch.

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "active_team_id" text;

ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "member_count" integer DEFAULT 0 NOT NULL;

ALTER TABLE "team_member" ADD COLUMN IF NOT EXISTS "membership_key" text;
CREATE UNIQUE INDEX IF NOT EXISTS "team_member_membership_key_uidx" ON "team_member" ("membership_key");

ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "team_id" text;
DO $$ BEGIN
  ALTER TABLE "invitation" ADD CONSTRAINT "invitation_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
