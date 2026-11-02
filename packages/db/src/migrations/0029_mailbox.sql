-- Internal mail app foundation (#344): persisted outbound message and recipient state.
CREATE TABLE IF NOT EXISTS "mail_message" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_message_id" text,
  "thread_id" text,
  "from_email" text NOT NULL,
  "reply_to" text,
  "subject" text NOT NULL,
  "html" text NOT NULL,
  "text" text NOT NULL,
  "template_key" text,
  "template_props" jsonb,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "category" text NOT NULL DEFAULT 'system',
  "delivery_status" text NOT NULL,
  "delivery_error" text,
  "idempotency_key" text,
  "sender_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "organization_id" text REFERENCES "organization"("id") ON DELETE SET NULL,
  "team_id" text REFERENCES "team"("id") ON DELETE SET NULL,
  "project_id" text REFERENCES "project"("id") ON DELETE SET NULL,
  "entity_type" text,
  "entity_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "mail_message_category_check" CHECK ("category" in ('system', 'work', 'personal')),
  CONSTRAINT "mail_message_delivery_status_check" CHECK ("delivery_status" in ('queued', 'sent', 'delivered', 'bounced', 'failed', 'skipped'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "mail_message_idempotency_uidx"
  ON "mail_message" ("idempotency_key") WHERE "idempotency_key" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "mail_message_provider_message_uidx"
  ON "mail_message" ("provider_message_id") WHERE "provider_message_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "mail_message_org_created_idx"
  ON "mail_message" ("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "mail_message_project_created_idx"
  ON "mail_message" ("project_id", "created_at");
CREATE INDEX IF NOT EXISTS "mail_message_sender_created_idx"
  ON "mail_message" ("sender_user_id", "created_at");

CREATE TABLE IF NOT EXISTS "mail_recipient" (
  "id" text PRIMARY KEY NOT NULL,
  "message_id" text NOT NULL REFERENCES "mail_message"("id") ON DELETE CASCADE,
  "recipient_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "email" text NOT NULL,
  "folder" text NOT NULL DEFAULT 'inbox',
  "read_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "starred_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "mail_recipient_folder_check" CHECK ("folder" in ('inbox', 'sent'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "mail_recipient_message_email_uidx"
  ON "mail_recipient" ("message_id", "email");
CREATE INDEX IF NOT EXISTS "mail_recipient_user_folder_created_idx"
  ON "mail_recipient" ("recipient_user_id", "folder", "created_at");
CREATE INDEX IF NOT EXISTS "mail_recipient_email_created_idx"
  ON "mail_recipient" ("email", "created_at");
