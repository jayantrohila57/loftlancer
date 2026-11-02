-- Private Vercel Blob metadata, reservations and organization quotas (#766).
CREATE TABLE IF NOT EXISTS "organization_storage_policy" (
  "organization_id" text PRIMARY KEY NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "storage_limit_bytes" integer NOT NULL DEFAULT 1073741824,
  "storage_used_bytes" integer NOT NULL DEFAULT 0,
  "storage_reserved_bytes" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organization_storage_policy_limit_check" CHECK ("storage_limit_bytes" >= 0),
  CONSTRAINT "organization_storage_policy_used_check" CHECK ("storage_used_bytes" >= 0),
  CONSTRAINT "organization_storage_policy_reserved_check" CHECK ("storage_reserved_bytes" >= 0)
);

CREATE TABLE IF NOT EXISTS "stored_file" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "project_id" text REFERENCES "project"("id") ON DELETE CASCADE,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "pathname" text NOT NULL UNIQUE,
  "blob_url" text UNIQUE,
  "original_name" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "upload_expires_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "stored_file_size_check" CHECK ("size_bytes" > 0),
  CONSTRAINT "stored_file_status_check" CHECK ("status" in ('pending', 'complete', 'failed', 'deleted'))
);
CREATE INDEX IF NOT EXISTS "stored_file_org_created_idx" ON "stored_file" ("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "stored_file_project_created_idx" ON "stored_file" ("project_id", "created_at");
CREATE INDEX IF NOT EXISTS "stored_file_pending_expiry_idx" ON "stored_file" ("status", "upload_expires_at");
