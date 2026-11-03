-- Platform MCP OAuth tables + audit extensions + rate limits (Decision 14).
-- Apply on Neon branch before enabling PLATFORM_AUTH_ENABLE_MCP on apps/auth.
-- Admin columns: see 0008_platform_admin.sql (console).

CREATE TABLE IF NOT EXISTS "jwks" (
  "id" text PRIMARY KEY NOT NULL,
  "public_key" text NOT NULL,
  "private_key" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "expires_at" timestamp,
  "alg" text,
  "crv" text
);

CREATE TABLE IF NOT EXISTS "oauth_client" (
  "id" text PRIMARY KEY NOT NULL,
  "client_id" text NOT NULL,
  "client_secret" text,
  "client_discovery_id" text,
  "disabled" boolean DEFAULT false,
  "skip_consent" boolean,
  "enable_end_session" boolean,
  "subject_type" text,
  "scopes" text[],
  "client_credentials_scopes" text[] DEFAULT '{}',
  "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp,
  "updated_at" timestamp,
  "name" text,
  "uri" text,
  "icon" text,
  "contacts" text[],
  "tos" text,
  "policy" text,
  "software_id" text,
  "software_version" text,
  "software_statement" text,
  "redirect_uris" text[] NOT NULL,
  "post_logout_redirect_uris" text[],
  "backchannel_logout_uri" text,
  "backchannel_logout_session_required" boolean,
  "token_endpoint_auth_method" text,
  "application_type" text,
  "jwks" text,
  "jwks_uri" text,
  "grant_types" text[],
  "response_types" text[],
  "require_pkce" boolean,
  "dpop_bound_access_tokens" boolean DEFAULT false,
  "reference_id" text,
  "metadata" jsonb,
  CONSTRAINT "oauth_client_client_id_unique" UNIQUE("client_id")
);

CREATE TABLE IF NOT EXISTS "oauth_resource" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "name" text NOT NULL,
  "access_token_ttl" integer,
  "refresh_token_ttl" integer,
  "signing_algorithm" text,
  "signing_key_id" text,
  "allowed_scopes" text[],
  "custom_claims" jsonb,
  "dpop_bound_access_tokens_required" boolean DEFAULT false,
  "disabled" boolean DEFAULT false,
  "created_at" timestamp,
  "updated_at" timestamp,
  "policy_version" integer DEFAULT 1,
  "metadata" jsonb,
  CONSTRAINT "oauth_resource_identifier_unique" UNIQUE("identifier")
);

CREATE TABLE IF NOT EXISTS "oauth_client_resource" (
  "id" text PRIMARY KEY NOT NULL,
  "client_id" text NOT NULL REFERENCES "oauth_client"("client_id") ON DELETE CASCADE,
  "resource_id" text NOT NULL REFERENCES "oauth_resource"("identifier") ON DELETE CASCADE,
  "metadata" jsonb,
  "created_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "oauth_client_resource_client_id_resource_id_uidx"
  ON "oauth_client_resource" ("client_id", "resource_id");

CREATE TABLE IF NOT EXISTS "oauth_refresh_token" (
  "id" text PRIMARY KEY NOT NULL,
  "token" text NOT NULL,
  "client_id" text NOT NULL REFERENCES "oauth_client"("client_id"),
  "session_id" text REFERENCES "session"("id") ON DELETE SET NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "reference_id" text,
  "authorization_code_id" text,
  "resources" text[],
  "requested_user_info_claims" text[],
  "expires_at" timestamp,
  "created_at" timestamp,
  "revoked" timestamp,
  "rotated_at" timestamp,
  "rotation_replay_response" text,
  "rotation_replay_expires_at" timestamp,
  "auth_time" timestamp,
  "confirmation" jsonb,
  "scopes" text[] NOT NULL,
  CONSTRAINT "oauth_refresh_token_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "oauth_access_token" (
  "id" text PRIMARY KEY NOT NULL,
  "token" text,
  "client_id" text NOT NULL REFERENCES "oauth_client"("client_id"),
  "session_id" text REFERENCES "session"("id") ON DELETE SET NULL,
  "user_id" text REFERENCES "user"("id"),
  "reference_id" text,
  "authorization_code_id" text,
  "resources" text[],
  "requested_user_info_claims" text[],
  "refresh_id" text REFERENCES "oauth_refresh_token"("id"),
  "expires_at" timestamp,
  "created_at" timestamp,
  "revoked" timestamp,
  "confirmation" jsonb,
  "scopes" text[] NOT NULL,
  CONSTRAINT "oauth_access_token_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "oauth_consent" (
  "id" text PRIMARY KEY NOT NULL,
  "client_id" text NOT NULL REFERENCES "oauth_client"("client_id"),
  "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
  "reference_id" text,
  "resources" text[],
  "requested_user_info_claims" text[],
  "scopes" text[] NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE IF NOT EXISTS "oauth_client_assertion" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "rate_limit_bucket" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer NOT NULL,
  "window_start" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "platform_feature_flag" (
  "key" text PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text REFERENCES "user"("id") ON DELETE SET NULL
);

ALTER TABLE "audit_event" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'trpc';
ALTER TABLE "audit_event" ADD COLUMN IF NOT EXISTS "oauth_client_id" text;
ALTER TABLE "audit_event" ADD COLUMN IF NOT EXISTS "mcp_tool" text;

CREATE INDEX IF NOT EXISTS "audit_event_source_created_idx"
  ON "audit_event" ("source", "created_at");

CREATE INDEX IF NOT EXISTS "oauth_client_user_id_idx" ON "oauth_client" ("user_id");
CREATE INDEX IF NOT EXISTS "oauth_refresh_token_client_id_idx" ON "oauth_refresh_token" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_refresh_token_user_id_idx" ON "oauth_refresh_token" ("user_id");
CREATE INDEX IF NOT EXISTS "oauth_access_token_client_id_idx" ON "oauth_access_token" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_consent_client_id_idx" ON "oauth_consent" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_consent_user_id_idx" ON "oauth_consent" ("user_id");
