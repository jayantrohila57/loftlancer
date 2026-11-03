-- Better Auth organization plugin tables + app org scoping
-- Safe to run on prod: adds new tables/columns only (nullable where noted).
-- Do NOT set ORGANIZATIONS_ENABLED=true until backfill completes (see docs/ORGANIZATION_MIGRATION.md).

CREATE TABLE IF NOT EXISTS "organization" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "logo" text,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "member" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" text DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "member_organization_user_idx" ON "member" ("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "member_user_id_idx" ON "member" ("user_id");

CREATE TABLE IF NOT EXISTS "invitation" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "expires_at" timestamp NOT NULL,
  "inviter_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "invitation_organization_id_idx" ON "invitation" ("organization_id");
CREATE INDEX IF NOT EXISTS "invitation_email_idx" ON "invitation" ("email");

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "active_organization_id" text;
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "organization_id" text REFERENCES "organization"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "project_organization_id_idx" ON "project" ("organization_id");
