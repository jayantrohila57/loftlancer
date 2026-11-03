ALTER TABLE "audit_log" ADD COLUMN "entity_slug" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "branch" text;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "deployed_url" text;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "is_production" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "environment" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "repository_url" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX "audit_log_environmentId_idx" ON "audit_log" USING btree ("environment_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_entityType_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_log_entitySlug_idx" ON "audit_log" USING btree ("entity_slug");--> statement-breakpoint
CREATE INDEX "environment_slug_idx" ON "environment" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "environment_status_idx" ON "environment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "environment_branch_idx" ON "environment" USING btree ("branch");--> statement-breakpoint
CREATE INDEX "project_slug_idx" ON "project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_isArchived_idx" ON "project" USING btree ("is_archived");--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_slug_unique" UNIQUE("slug");