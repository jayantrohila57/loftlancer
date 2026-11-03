-- Support app: tickets, messages, FAQ, platform support managers (#124).
-- Do not apply to production without owner approval.

CREATE SEQUENCE IF NOT EXISTS support_ticket_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS "platform_support_manager" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "granted_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "support_ticket" (
  "id" text PRIMARY KEY NOT NULL,
  "ticket_number" integer NOT NULL DEFAULT nextval('support_ticket_number_seq'),
  "subject" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "priority" text DEFAULT 'normal' NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "requester_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "assignee_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "organization_id" text REFERENCES "organization"("id") ON DELETE SET NULL,
  "project_id" text REFERENCES "project"("id") ON DELETE SET NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  CONSTRAINT "support_ticket_ticket_number_unique" UNIQUE("ticket_number")
);

CREATE TABLE IF NOT EXISTS "support_ticket_message" (
  "id" text PRIMARY KEY NOT NULL,
  "ticket_id" text NOT NULL REFERENCES "support_ticket"("id") ON DELETE CASCADE,
  "author_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "is_internal" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "support_faq_article" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "category" text NOT NULL,
  "body" text NOT NULL,
  "published" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "updated_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text REFERENCES "user"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "support_faq_article_slug_active_uidx"
  ON "support_faq_article" ("slug")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "support_ticket_requester_status_idx"
  ON "support_ticket" ("requester_user_id", "status");

CREATE INDEX IF NOT EXISTS "support_ticket_status_created_idx"
  ON "support_ticket" ("status", "created_at");

CREATE INDEX IF NOT EXISTS "support_ticket_assignee_idx"
  ON "support_ticket" ("assignee_user_id");

CREATE INDEX IF NOT EXISTS "support_ticket_message_ticket_created_idx"
  ON "support_ticket_message" ("ticket_id", "created_at");

CREATE INDEX IF NOT EXISTS "support_faq_article_category_sort_idx"
  ON "support_faq_article" ("category", "sort_order");
