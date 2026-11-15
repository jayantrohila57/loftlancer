ALTER TABLE "organization_profile" ADD COLUMN "tagline" varchar(120);--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "services" jsonb;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "specializations" jsonb;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "business_size" text;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "year_established" integer;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "portfolio_url" text;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD COLUMN "social_profiles" jsonb;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "default_language" varchar(16);--> statement-breakpoint
CREATE TABLE "organization_contact" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"primary_email" text NOT NULL,
	"alternative_email" text,
	"support_email" text,
	"business_phone" text,
	"contact_person" text,
	"preferred_language" varchar(16),
	"business_hours" jsonb,
	"extra_emails" jsonb
);--> statement-breakpoint
CREATE TABLE "organization_address" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"state_province" text,
	"city" text,
	"address_line_1" text,
	"address_line_2" text,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"default_language" varchar(16),
	"billing_same_as_primary" boolean
);--> statement-breakpoint
CREATE TABLE "organization_legal" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"legal_business_name" text,
	"legal_entity_type" text,
	"registration_number" text,
	"tax_registration_status" text,
	"registered_address" jsonb,
	"invoice_legal_name" text,
	"skipped" boolean DEFAULT false NOT NULL
);--> statement-breakpoint
CREATE TABLE "organization_tax" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"tax_id_type" text,
	"tax_id_number" text,
	"tax_document_asset_id" text,
	"tax_document_url" text
);--> statement-breakpoint
CREATE TABLE "organization_branding" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"primary_logo_asset_id" text,
	"secondary_logo_asset_id" text,
	"cover_image_asset_id" text,
	"brand_color" varchar(32),
	"custom_domain" text,
	"email_signature_html" text,
	"document_footer" text
);--> statement-breakpoint
CREATE TABLE "organization_workspace" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"workspace_visibility" varchar(16),
	"default_project_visibility" varchar(16),
	"default_member_role" varchar(16),
	"project_number_prefix" text,
	"invoice_number_prefix" text,
	"default_payment_terms" text,
	"default_hourly_rate" integer,
	"workweek" jsonb,
	"date_time_format" text,
	"number_format" text,
	"fiscal_year_start_month" integer
);--> statement-breakpoint
ALTER TABLE "organization_contact" ADD CONSTRAINT "organization_contact_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_address" ADD CONSTRAINT "organization_address_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_legal" ADD CONSTRAINT "organization_legal_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tax" ADD CONSTRAINT "organization_tax_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_branding" ADD CONSTRAINT "organization_branding_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_workspace" ADD CONSTRAINT "organization_workspace_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;