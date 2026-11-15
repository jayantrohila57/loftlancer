CREATE TABLE "regional_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"language" text,
	"region" text,
	"time_zone" text,
	"date_style" text,
	"hour_cycle" text,
	"currency" text,
	"number_grouping" text,
	"measurement_system" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "regional_preferences" ADD CONSTRAINT "regional_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;