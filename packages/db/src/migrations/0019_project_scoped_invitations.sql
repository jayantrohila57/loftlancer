ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "project_id" text;

DO $$ BEGIN
  ALTER TABLE "invitation" ADD CONSTRAINT "invitation_project_id_project_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "invitation_project_id_idx" ON "invitation" ("project_id");
