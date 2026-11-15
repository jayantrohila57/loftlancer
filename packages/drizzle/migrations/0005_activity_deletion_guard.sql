CREATE TABLE "activity_event_tombstone" (
	"id_hash" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
-- A digest, not event contents or ownership, is retained to reject old retries.
CREATE FUNCTION "public"."activity_guard_deleted_id"()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  deleted_hash text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.activity_id, 0));
  deleted_hash := encode(sha256(convert_to(NEW.activity_id, 'UTF8')), 'hex');
  IF EXISTS (SELECT 1 FROM "public"."activity_event_tombstone" AS tombstone WHERE tombstone.id_hash = deleted_hash) THEN
    RAISE EXCEPTION 'Deleted activity IDs cannot be reused' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER activity_event_guard_deleted BEFORE INSERT
ON "public"."activity_event" FOR EACH ROW EXECUTE FUNCTION "public"."activity_guard_deleted_id"();
--> statement-breakpoint
CREATE FUNCTION "public"."activity_remember_deleted_id"()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(OLD.activity_id, 0));
  INSERT INTO "public"."activity_event_tombstone" (id_hash)
  VALUES (encode(sha256(convert_to(OLD.activity_id, 'UTF8')), 'hex'))
  ON CONFLICT DO NOTHING;
  RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER activity_event_remember_deleted BEFORE DELETE
ON "public"."activity_event" FOR EACH ROW EXECUTE FUNCTION "public"."activity_remember_deleted_id"();
