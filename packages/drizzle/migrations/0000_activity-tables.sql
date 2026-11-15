CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permission" (
  "user_id" text PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "location_enabled" boolean NOT NULL DEFAULT false,
  "location_decision_at" timestamptz,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activity" (
  "id" text PRIMARY KEY, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "occurred_at" timestamptz NOT NULL DEFAULT now(), "type" text NOT NULL,
  "outcome" text NOT NULL, "source" text NOT NULL, "resource_type" text,
  "resource_id" text, "metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_user_time_idx" ON "user_activity" ("user_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_user_type_idx" ON "user_activity" ("user_id", "type");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "security_activity" (
  "id" text PRIMARY KEY, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "occurred_at" timestamptz NOT NULL DEFAULT now(), "type" text NOT NULL,
  "outcome" text NOT NULL, "session_id" text, "ip_address" text,
  "user_agent" text, "metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "security_activity_user_time_idx" ON "security_activity" ("user_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "security_activity_user_type_idx" ON "security_activity" ("user_id", "type");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_location" (
  "id" text PRIMARY KEY, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "captured_at" timestamptz NOT NULL DEFAULT now(), "session_id" text,
  "event_id" text REFERENCES "security_activity"("id") ON DELETE SET NULL,
  "latitude" double precision NOT NULL, "longitude" double precision NOT NULL,
  "accuracy_meters" double precision NOT NULL, "source" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_location_user_time_idx" ON "activity_location" ("user_id", "captured_at");