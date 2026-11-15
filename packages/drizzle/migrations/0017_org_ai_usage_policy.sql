CREATE TABLE "org_ai_usage_policy" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"alert_low_balance_enabled" boolean DEFAULT true NOT NULL,
	"alert_very_low_balance_enabled" boolean DEFAULT true NOT NULL,
	"alert_depleted_enabled" boolean DEFAULT true NOT NULL,
	"monthly_spend_cap_enabled" boolean DEFAULT false NOT NULL,
	"monthly_spend_cap_credits" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_ai_usage_policy" ADD CONSTRAINT "org_ai_usage_policy_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;