CREATE TABLE "user_support_ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_support_ticket" ADD CONSTRAINT "user_support_ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;