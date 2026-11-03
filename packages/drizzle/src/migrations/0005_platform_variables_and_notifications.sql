-- Combined platform migration (approve once for prod):
-- Part A: Variables v2 (type, note, provenance)
-- Part B: Notifications

-- --- Part A: Variables v2 ---
-- Defaults: existing rows -> type 'secret'; created_by/updated_by -> project owner (user_id).

CREATE TYPE "public"."environment_variable_type" AS ENUM('secret', 'config');--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "created_by" text;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "updated_by" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "type" "environment_variable_type" DEFAULT 'secret' NOT NULL;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "note" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "created_by" text;--> statement-breakpoint
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "updated_by" text;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "environment" ADD CONSTRAINT "environment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "environment" ADD CONSTRAINT "environment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "environment_variable" ADD CONSTRAINT "environment_variable_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
UPDATE "environment" AS e
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "project" AS p
WHERE e."project_id" = p."id"
  AND (e."created_by" IS NULL OR e."updated_by" IS NULL);--> statement-breakpoint
UPDATE "environment_variable" AS ev
SET
  "created_by" = p."user_id",
  "updated_by" = p."user_id"
FROM "environment" AS e
INNER JOIN "project" AS p ON e."project_id" = p."id"
WHERE ev."environment_id" = e."id"
  AND (ev."created_by" IS NULL OR ev."updated_by" IS NULL);--> statement-breakpoint

-- --- Part B: Notifications ---
CREATE TABLE IF NOT EXISTS "notification" (
  "id" text PRIMARY KEY NOT NULL,
  "recipient_user_id" text,
  "recipient_email" text,
  "organization_id" text,
  "type" text NOT NULL,
  "actor_user_id" text,
  "entity_type" text,
  "entity_id" text,
  "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "title" text,
  "body" text,
  "read_at" timestamp,
  "idempotency_key" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "notification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "notification_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipient_user_read_created_idx" ON "notification" ("recipient_user_id", "read_at", "created_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipient_email_idx" ON "notification" ("recipient_email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_user_idempotency_uidx" ON "notification" ("recipient_user_id", "idempotency_key") WHERE "idempotency_key" IS NOT NULL AND "recipient_user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_email_idempotency_uidx" ON "notification" ("recipient_email", "idempotency_key") WHERE "idempotency_key" IS NOT NULL AND "recipient_email" IS NOT NULL;
