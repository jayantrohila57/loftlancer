CREATE TABLE "activity_event" (
	"activity_id" text PRIMARY KEY NOT NULL,
	"action_id" text NOT NULL,
	"category" text NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"owner_user_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_user_id" text,
	"outcome" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_app" text,
	"source_module" text,
	"resource_type" text,
	"resource_id" text,
	"before_value" jsonb,
	"after_value" jsonb,
	"metadata" jsonb,
	"target" jsonb,
	"correlation_id" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "activity_event_identity_check" CHECK (length("activity_event"."activity_id") BETWEEN 1 AND 256 AND length("activity_event"."action_id") BETWEEN 1 AND 160 AND length("activity_event"."category") BETWEEN 1 AND 80 AND "activity_event"."schema_version" > 0),
	CONSTRAINT "activity_event_actor_check" CHECK ("activity_event"."actor_type" IN ('user', 'system', 'integration', 'unknown') AND ("activity_event"."actor_user_id" IS NULL OR "activity_event"."actor_type" = 'user')),
	CONSTRAINT "activity_event_outcome_check" CHECK ("activity_event"."outcome" IN ('success', 'denied', 'failed', 'error', 'unknown')),
	CONSTRAINT "activity_event_values_check" CHECK (("activity_event"."before_value" IS NULL OR (jsonb_typeof("activity_event"."before_value") = 'object' AND octet_length("activity_event"."before_value"::text) <= 65536)) AND ("activity_event"."after_value" IS NULL OR (jsonb_typeof("activity_event"."after_value") = 'object' AND octet_length("activity_event"."after_value"::text) <= 65536)) AND ("activity_event"."metadata" IS NULL OR (jsonb_typeof("activity_event"."metadata") = 'object' AND octet_length("activity_event"."metadata"::text) <= 65536))),
	CONSTRAINT "activity_event_target_check" CHECK ("activity_event"."target" IS NULL OR (jsonb_typeof("activity_event"."target") = 'object' AND "activity_event"."target" ? 'routeKey' AND jsonb_typeof("activity_event"."target"->'routeKey') = 'string' AND length("activity_event"."target"->>'routeKey') BETWEEN 1 AND 160 AND octet_length("activity_event"."target"::text) <= 4096))
);
--> statement-breakpoint
ALTER TABLE "activity_location" ADD COLUMN "activity_id" text;--> statement-breakpoint
ALTER TABLE "activity_event" ADD CONSTRAINT "activity_event_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_event" ADD CONSTRAINT "activity_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_event_owner_time_idx" ON "activity_event" USING btree ("owner_user_id","occurred_at","activity_id");--> statement-breakpoint
CREATE INDEX "activity_event_owner_category_time_idx" ON "activity_event" USING btree ("owner_user_id","category","occurred_at","activity_id");--> statement-breakpoint
CREATE INDEX "activity_event_owner_action_time_idx" ON "activity_event" USING btree ("owner_user_id","action_id","occurred_at","activity_id");--> statement-breakpoint
ALTER TABLE "activity_location" ADD CONSTRAINT "activity_location_activity_id_activity_event_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity_event"("activity_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_location_activity_idx" ON "activity_location" USING btree ("activity_id");
--> statement-breakpoint
-- Coordinate backfill with old producers. Drizzle runs this migration in one transaction.
LOCK TABLE "public"."user_activity", "public"."security_activity", "public"."activity_location" IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
-- Transitional adapter: preserve unknown legacy details rather than inventing identity.
CREATE FUNCTION "public"."activity_import_legacy"(kind text, entry jsonb)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  action_key text;
  event_category text;
BEGIN
  action_key := CASE entry->>'type'
    WHEN 'profile_updated' THEN 'account.profile.update'
    WHEN 'avatar_updated' THEN 'account.avatar.update'
    WHEN 'avatar_removed' THEN 'account.avatar.remove'
    WHEN 'provider_disconnected' THEN 'security.provider.unlink'
    WHEN 'sign_in' THEN 'auth.sign_in'
    WHEN 'sign_out' THEN 'auth.sign_out'
    WHEN 'session_revoked' THEN 'auth.session.revoke'
    WHEN 'session_ended' THEN 'auth.session.end'
    ELSE 'legacy.' || kind
  END;
  event_category := CASE
    WHEN action_key LIKE 'auth.%' THEN 'authentication'
    WHEN action_key LIKE 'security.%' OR kind = 'security' THEN 'security'
    ELSE 'account'
  END;
  INSERT INTO "public"."activity_event" (
    activity_id, action_id, category, owner_user_id, actor_type, outcome,
    occurred_at, source_module, resource_type, resource_id,
    session_id, ip_address, user_agent, metadata
  ) VALUES (
    'legacy:' || kind || ':' || (entry->>'id'), action_key, event_category,
    entry->>'user_id', 'unknown',
    CASE entry->>'outcome'
      WHEN 'success' THEN 'success' WHEN 'denied' THEN 'denied'
      WHEN 'failed' THEN 'failed' WHEN 'failure' THEN 'failed'
      WHEN 'error' THEN 'error' ELSE 'unknown' END,
    (entry->>'occurred_at')::timestamptz,
    CASE WHEN kind = 'user' THEN entry->>'source' ELSE 'security' END,
    entry->>'resource_type', entry->>'resource_id',
    entry->>'session_id', entry->>'ip_address', entry->>'user_agent',
    jsonb_build_object('legacyTable', kind || '_activity',
      'legacyId', entry->>'id', 'legacyType', entry->>'type',
      'legacyOutcome', entry->>'outcome', 'data', entry->'metadata')
  ) ON CONFLICT (activity_id) DO UPDATE SET
    action_id = EXCLUDED.action_id, category = EXCLUDED.category,
    owner_user_id = EXCLUDED.owner_user_id, outcome = EXCLUDED.outcome,
    occurred_at = EXCLUDED.occurred_at, source_module = EXCLUDED.source_module,
    resource_type = EXCLUDED.resource_type, resource_id = EXCLUDED.resource_id,
    session_id = EXCLUDED.session_id, ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent, metadata = EXCLUDED.metadata;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION "public"."activity_sync_legacy"()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  kind text := CASE TG_TABLE_NAME WHEN 'user_activity' THEN 'user' ELSE 'security' END;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "public"."activity_event" WHERE activity_id = 'legacy:' || kind || ':' || OLD.id;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.id IS DISTINCT FROM OLD.id THEN
    DELETE FROM "public"."activity_event" WHERE activity_id = 'legacy:' || kind || ':' || OLD.id;
  END IF;
  PERFORM "public"."activity_import_legacy"(kind, to_jsonb(NEW));
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER activity_user_legacy_sync AFTER INSERT OR UPDATE OR DELETE
ON "public"."user_activity" FOR EACH ROW EXECUTE FUNCTION "public"."activity_sync_legacy"();
--> statement-breakpoint
CREATE TRIGGER activity_security_legacy_sync AFTER INSERT OR UPDATE OR DELETE
ON "public"."security_activity" FOR EACH ROW EXECUTE FUNCTION "public"."activity_sync_legacy"();
--> statement-breakpoint
SELECT "public"."activity_import_legacy"('user', to_jsonb(entry)) FROM "public"."user_activity" AS entry;
--> statement-breakpoint
SELECT "public"."activity_import_legacy"('security', to_jsonb(entry)) FROM "public"."security_activity" AS entry;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "public"."activity_location" AS location
    JOIN "public"."security_activity" AS event ON event.id = location.event_id
    WHERE location.user_id <> event.user_id
  ) THEN
    RAISE EXCEPTION 'Existing activity location owner mismatch' USING ERRCODE = '23514';
  END IF;
END $$;
--> statement-breakpoint
UPDATE "public"."activity_location" SET activity_id = 'legacy:security:' || event_id WHERE event_id IS NOT NULL;
--> statement-breakpoint
-- Keep old location writers working; reject cross-owner links on either reference.
CREATE FUNCTION "public"."activity_link_location"()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  event_owner text;
  expected_id text;
BEGIN
  IF NEW.event_id IS NOT NULL THEN
    SELECT user_id INTO event_owner FROM "public"."security_activity" WHERE id = NEW.event_id;
    IF event_owner IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'Activity location owner mismatch' USING ERRCODE = '23514';
    END IF;
    expected_id := 'legacy:security:' || NEW.event_id;
    IF TG_OP = 'INSERT' THEN
      IF NEW.activity_id IS NULL THEN NEW.activity_id := expected_id; END IF;
    ELSIF NEW.event_id IS DISTINCT FROM OLD.event_id AND NEW.activity_id IS NOT DISTINCT FROM OLD.activity_id THEN
      NEW.activity_id := expected_id;
    END IF;
    IF NEW.activity_id IS NOT NULL AND NEW.activity_id <> expected_id THEN
      RAISE EXCEPTION 'Activity location reference mismatch' USING ERRCODE = '23514';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.event_id IS NOT NULL AND NEW.activity_id IS NOT DISTINCT FROM OLD.activity_id THEN
      NEW.activity_id := NULL;
    END IF;
  END IF;
  IF NEW.activity_id IS NOT NULL THEN
    SELECT owner_user_id INTO event_owner FROM "public"."activity_event" WHERE activity_id = NEW.activity_id;
    IF event_owner IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'Activity location owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER activity_location_link BEFORE INSERT OR UPDATE
ON "public"."activity_location" FOR EACH ROW EXECUTE FUNCTION "public"."activity_link_location"();
--> statement-breakpoint
-- Prevent canonical deletion from leaving a legacy copy that could be reimported.
CREATE FUNCTION "public"."activity_delete_legacy"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.activity_id LIKE 'legacy:user:%' THEN
    DELETE FROM "public"."user_activity" WHERE id = substr(OLD.activity_id, 13);
  ELSIF OLD.activity_id LIKE 'legacy:security:%' THEN
    DELETE FROM "public"."security_activity" WHERE id = substr(OLD.activity_id, 17);
  END IF;
  RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER activity_event_delete_legacy AFTER DELETE
ON "public"."activity_event" FOR EACH ROW EXECUTE FUNCTION "public"."activity_delete_legacy"();
