ALTER TABLE "user_data_export_request" ADD COLUMN "artifact_path" text;--> statement-breakpoint
ALTER TABLE "user_data_export_request" ADD COLUMN "artifact_url" text;--> statement-breakpoint
ALTER TABLE "user_data_export_request" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_data_export_request" ADD COLUMN "delivered_at" timestamp with time zone;