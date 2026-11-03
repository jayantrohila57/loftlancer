-- Better Auth JWT + device authorization tables for apps/auth (P2).
-- Review on a Neon branch before production. Do NOT apply to prod default until approved.

CREATE TABLE IF NOT EXISTS "jwks" (
  "id" text PRIMARY KEY NOT NULL,
  "public_key" text NOT NULL,
  "private_key" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "expires_at" timestamp,
  "alg" text,
  "crv" text
);

CREATE TABLE IF NOT EXISTS "device_code" (
  "id" text PRIMARY KEY NOT NULL,
  "device_code" text NOT NULL,
  "user_code" text NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "status" text NOT NULL,
  "last_polled_at" timestamp,
  "polling_interval" integer,
  "client_id" text,
  "scope" text
);

CREATE UNIQUE INDEX IF NOT EXISTS "device_code_device_code_uidx" ON "device_code" ("device_code");
CREATE UNIQUE INDEX IF NOT EXISTS "device_code_user_code_uidx" ON "device_code" ("user_code");
