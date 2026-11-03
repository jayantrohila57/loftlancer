-- =============================================================================
-- SINGLE PROD APPROVAL BUNDLE (test on Neon branch; NOT production default).
-- Combines 0005 + 0006 from Drizzle schema on main.
-- =============================================================================

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

-- Actions, permissions, audit_event, teams, project access, soft deletes
-- Do NOT run on production until approved. Test on Neon branch first.
-- Feature flags ACTIONS_AUDIT_ENABLED remain false until after this migration.

-- --- Better Auth teams ---
CREATE TABLE IF NOT EXISTS "team" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "team_organization_id_idx" ON "team" ("organization_id");

CREATE TABLE IF NOT EXISTS "team_member" (
  "id" text PRIMARY KEY NOT NULL,
  "team_id" text NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "team_member_team_id_idx" ON "team_member" ("team_id");
CREATE INDEX IF NOT EXISTS "team_member_user_id_idx" ON "team_member" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "team_member_team_user_uidx" ON "team_member" ("team_id", "user_id");

-- --- Project access ---
CREATE TABLE IF NOT EXISTS "project_manager" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_manager_project_user_uidx"
  ON "project_manager" ("project_id", "user_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_manager_user_idx" ON "project_manager" ("user_id");

CREATE TABLE IF NOT EXISTS "project_team" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "team_id" text NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_team_project_team_uidx"
  ON "project_team" ("project_id", "team_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_team_project_idx" ON "project_team" ("project_id");

CREATE TABLE IF NOT EXISTS "project_member_grant" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "grants" text[] NOT NULL DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "updated_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_member_grant_project_user_uidx"
  ON "project_member_grant" ("project_id", "user_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_member_grant_user_idx" ON "project_member_grant" ("user_id");

-- --- Action block list ---
CREATE TABLE IF NOT EXISTS "action_block" (
  "id" text PRIMARY KEY NOT NULL,
  "action" text NOT NULL,
  "scope_type" text NOT NULL,
  "scope_id" text,
  "reason" text,
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "expires_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "action_block_scope_idx" ON "action_block" ("scope_type", "scope_id");
CREATE INDEX IF NOT EXISTS "action_block_action_idx" ON "action_block" ("action");

-- --- audit_event ---
CREATE TABLE IF NOT EXISTS "audit_event" (
  "id" text PRIMARY KEY NOT NULL,
  "action" text NOT NULL,
  "result" text NOT NULL,
  "actor_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "organization_id" text REFERENCES "organization"("id") ON DELETE SET NULL,
  "project_id" text REFERENCES "project"("id") ON DELETE SET NULL,
  "environment_id" text REFERENCES "environment"("id") ON DELETE SET NULL,
  "entity_type" text NOT NULL,
  "entity_id" text,
  "entity_slug" text,
  "target_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "denial_reason" text,
  "error_code" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "ip_address" text,
  "user_agent" text,
  "duration_ms" integer,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "audit_event_org_created_idx"
  ON "audit_event" ("organization_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_event_actor_created_idx"
  ON "audit_event" ("actor_user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_event_project_created_idx"
  ON "audit_event" ("project_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_event_action_created_idx"
  ON "audit_event" ("action", "created_at" DESC);

-- --- Soft deletes ---
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "environment" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "environment_variable" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;
ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL;

-- Partial unique: project slug among active rows
ALTER TABLE "project" DROP CONSTRAINT IF EXISTS "project_slug_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "project_slug_active_uidx"
  ON "project" ("slug") WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "environment_project_slug_active_uidx"
  ON "environment" ("project_id", "slug") WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "environment_variable_env_key_active_uidx"
  ON "environment_variable" ("environment_id", "key") WHERE "deleted_at" IS NULL;

-- Org member role migration (legacy admin -> manager)
UPDATE "member" SET "role" = 'manager' WHERE "role" = 'admin';

-- Backfill audit_event from audit_log (success only)
INSERT INTO "audit_event" (
  "id", "action", "result", "actor_user_id", "organization_id", "project_id",
  "environment_id", "entity_type", "entity_slug", "payload", "ip_address",
  "user_agent", "created_at"
)
SELECT
  al."id",
  CASE
    WHEN al."entity_type" = 'PROJECT' AND al."action" = 'CREATE' THEN 'project.create'
    WHEN al."entity_type" = 'PROJECT' AND al."action" = 'UPDATE' THEN 'project.update'
    WHEN al."entity_type" = 'PROJECT' AND al."action" = 'DELETE' THEN 'project.delete'
    WHEN al."entity_type" = 'ENVIRONMENT' AND al."action" = 'CREATE' THEN 'environment.create'
    WHEN al."entity_type" = 'ENVIRONMENT' AND al."action" = 'UPDATE' THEN 'environment.update'
    WHEN al."entity_type" = 'ENVIRONMENT' AND al."action" = 'DELETE' THEN 'environment.delete'
    WHEN al."entity_type" = 'VARIABLE' AND al."action" = 'CREATE' THEN 'variable.create'
    WHEN al."entity_type" = 'VARIABLE' AND al."action" = 'UPDATE' THEN 'variable.update'
    WHEN al."entity_type" = 'VARIABLE' AND al."action" = 'DELETE' THEN 'variable.delete'
    WHEN al."entity_type" = 'VARIABLE' AND al."action" = 'BULK_IMPORT' THEN 'variable.bulk_import'
    WHEN al."entity_type" = 'VARIABLE' AND al."action" = 'EXPORT' THEN 'variable.export'
    ELSE 'legacy.' || lower(al."entity_type") || '.' || lower(al."action")
  END,
  'success',
  al."user_id",
  p."organization_id",
  al."project_id",
  al."environment_id",
  lower(al."entity_type"),
  al."entity_slug",
  jsonb_build_object(
    'legacyAction', al."action",
    'oldValue', al."old_value",
    'newValue', al."new_value",
    'metadata', al."metadata",
    'variableId', al."variable_id"
  ),
  al."ip_address",
  al."user_agent",
  COALESCE(al."created_at", now())
FROM "audit_log" al
LEFT JOIN "project" p ON p."id" = al."project_id"
ON CONFLICT ("id") DO NOTHING;
