-- Legacy account/security views can share one provider event without a duplicate.
CREATE OR REPLACE FUNCTION "public"."activity_sync_legacy"()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  kind text := CASE TG_TABLE_NAME WHEN 'user_activity' THEN 'user' ELSE 'security' END;
  old_mirror boolean := false;
  new_mirror boolean := false;
BEGIN
  IF kind = 'user' AND TG_OP <> 'INSERT' THEN
    old_mirror := COALESCE(OLD.type = 'provider_disconnected' AND OLD.metadata->>'mirrorSecurityId' = OLD.id, false);
  END IF;
  IF kind = 'user' AND TG_OP <> 'DELETE' THEN
    new_mirror := COALESCE(NEW.type = 'provider_disconnected' AND NEW.metadata->>'mirrorSecurityId' = NEW.id, false);
    IF new_mirror AND NOT EXISTS (
      SELECT 1 FROM "public"."security_activity" s
      WHERE s.id = NEW.id AND s.user_id = NEW.user_id AND s.type = 'provider_disconnected'
    ) THEN
      RAISE EXCEPTION 'Provider mirror does not match security event' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    IF NOT old_mirror THEN
      DELETE FROM "public"."activity_event" WHERE activity_id = 'legacy:' || kind || ':' || OLD.id;
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND NOT old_mirror AND (NEW.id IS DISTINCT FROM OLD.id OR new_mirror) THEN
    DELETE FROM "public"."activity_event" WHERE activity_id = 'legacy:' || kind || ':' || OLD.id;
  END IF;
  IF NOT new_mirror THEN
    PERFORM "public"."activity_import_legacy"(kind, to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."activity_delete_legacy"()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE legacy_id text;
BEGIN
  IF OLD.activity_id LIKE 'legacy:user:%' THEN
    DELETE FROM "public"."user_activity" WHERE id = substr(OLD.activity_id, 13);
  ELSIF OLD.activity_id LIKE 'legacy:security:%' THEN
    legacy_id := substr(OLD.activity_id, 17);
    DELETE FROM "public"."user_activity" WHERE id = legacy_id AND metadata->>'mirrorSecurityId' = legacy_id AND user_id = OLD.owner_user_id;
    DELETE FROM "public"."security_activity" WHERE id = legacy_id;
  END IF;
  RETURN OLD;
END;
$$;
