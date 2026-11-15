CREATE TABLE "ai_credit_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"state" text DEFAULT 'held' NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"held_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"settled_at" timestamp,
	"released_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autumn_track_outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"feature_id" text NOT NULL,
	"value" bigint NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_webhook_event" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"customer_id" text,
	"organization_id" text,
	"payload_hash" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "org_entitlement" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"plan_tier" text DEFAULT 'free' NOT NULL,
	"subscription_status" text DEFAULT 'active' NOT NULL,
	"quota_bytes" bigint DEFAULT 2147483648 NOT NULL,
	"ai_enabled" boolean DEFAULT false NOT NULL,
	"ai_credit_balance" integer DEFAULT 0 NOT NULL,
	"storage_credit_balance" integer DEFAULT 0 NOT NULL,
	"autumn_customer_id" text,
	"entitlements_synced_at" timestamp,
	"entitlements_degraded" boolean DEFAULT false NOT NULL,
	"subscription_revision" integer DEFAULT 0 NOT NULL,
	"org_provisioning_step" text DEFAULT 'created' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_entitlement_autumn_customer_id_unique" UNIQUE("autumn_customer_id")
);
--> statement-breakpoint
CREATE TABLE "org_storage_folder" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parent_folder_id" text,
	"display_name" text NOT NULL,
	"is_root" boolean DEFAULT false NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"trashed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "org_storage_grant" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"folder_id" text,
	"item_id" text,
	"user_id" text NOT NULL,
	"access_level" text DEFAULT 'view_edit' NOT NULL,
	"includes_descendants" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_storage_item" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"folder_id" text,
	"uploaded_by_user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"storage_provider" text DEFAULT 'vercel_blob' NOT NULL,
	"blob_pathname" text NOT NULL,
	"access_mode" text DEFAULT 'org_private' NOT NULL,
	"purpose" text DEFAULT 'org_upload' NOT NULL,
	"status" text DEFAULT 'pending_upload' NOT NULL,
	"checksum" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"trashed_at" timestamp,
	"purged_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "ai_credit_ledger" ADD CONSTRAINT "ai_credit_ledger_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autumn_track_outbox" ADD CONSTRAINT "autumn_track_outbox_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_webhook_event" ADD CONSTRAINT "billing_webhook_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_entitlement" ADD CONSTRAINT "org_entitlement_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_folder" ADD CONSTRAINT "org_storage_folder_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_folder" ADD CONSTRAINT "org_storage_folder_parent_folder_id_fk" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."org_storage_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_grant" ADD CONSTRAINT "org_storage_grant_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_grant" ADD CONSTRAINT "org_storage_grant_folder_id_org_storage_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."org_storage_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_grant" ADD CONSTRAINT "org_storage_grant_item_id_org_storage_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."org_storage_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_grant" ADD CONSTRAINT "org_storage_grant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_item" ADD CONSTRAINT "org_storage_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_item" ADD CONSTRAINT "org_storage_item_folder_id_org_storage_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."org_storage_folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_storage_item" ADD CONSTRAINT "org_storage_item_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_credit_ledger_org_idempotency_uidx" ON "ai_credit_ledger" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "ai_credit_ledger_org_state_idx" ON "ai_credit_ledger" USING btree ("organization_id","state");--> statement-breakpoint
CREATE INDEX "ai_credit_ledger_expires_at_idx" ON "ai_credit_ledger" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "autumn_track_outbox_idempotency_uidx" ON "autumn_track_outbox" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "autumn_track_outbox_status_idx" ON "autumn_track_outbox" USING btree ("status");--> statement-breakpoint
CREATE INDEX "billing_webhook_event_org_id_idx" ON "billing_webhook_event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "billing_webhook_event_customer_id_idx" ON "billing_webhook_event" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "billing_webhook_event_status_idx" ON "billing_webhook_event" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "org_entitlement_autumn_customer_uidx" ON "org_entitlement" USING btree ("autumn_customer_id");--> statement-breakpoint
CREATE INDEX "org_entitlement_plan_tier_idx" ON "org_entitlement" USING btree ("plan_tier");--> statement-breakpoint
CREATE INDEX "org_storage_folder_org_id_idx" ON "org_storage_folder" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_storage_folder_parent_id_idx" ON "org_storage_folder" USING btree ("parent_folder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_storage_folder_org_parent_name_uidx" ON "org_storage_folder" USING btree ("organization_id","parent_folder_id","display_name");--> statement-breakpoint
CREATE INDEX "org_storage_grant_org_id_idx" ON "org_storage_grant" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_storage_grant_user_id_idx" ON "org_storage_grant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_storage_grant_folder_id_idx" ON "org_storage_grant" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "org_storage_grant_item_id_idx" ON "org_storage_grant" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "org_storage_item_org_id_idx" ON "org_storage_item" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_storage_item_folder_id_idx" ON "org_storage_item" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "org_storage_item_status_idx" ON "org_storage_item" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "org_storage_item_org_folder_name_uidx" ON "org_storage_item" USING btree ("organization_id","folder_id","display_name");--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_uidx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "organization" USING btree ("slug");