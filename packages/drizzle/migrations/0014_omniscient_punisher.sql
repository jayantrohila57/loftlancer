CREATE TYPE "public"."organization_type" AS ENUM('freelancer', 'studio', 'agency', 'company');--> statement-breakpoint
CREATE TABLE "organization_profile" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"type" "organization_type" NOT NULL,
	"description" text,
	"country_code" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"currency_code" varchar(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_profile" ADD CONSTRAINT "organization_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;