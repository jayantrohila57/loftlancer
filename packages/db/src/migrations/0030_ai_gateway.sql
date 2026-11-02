-- AI Gateway policy and immutable token metering (#765).
CREATE TABLE IF NOT EXISTS "organization_ai_policy" (
  "organization_id" text PRIMARY KEY NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "allowed_models" jsonb NOT NULL DEFAULT '["openai/gpt-4.1-mini"]'::jsonb,
  "monthly_token_limit" integer NOT NULL DEFAULT 100000,
  "monthly_tokens_used" integer NOT NULL DEFAULT 0,
  "period_started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organization_ai_policy_limit_check" CHECK ("monthly_token_limit" >= 0),
  CONSTRAINT "organization_ai_policy_used_check" CHECK ("monthly_tokens_used" >= 0)
);

CREATE TABLE IF NOT EXISTS "ai_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "project_id" text REFERENCES "project"("id") ON DELETE SET NULL,
  "actor_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "gateway_call_id" text NOT NULL UNIQUE,
  "model" text NOT NULL,
  "input_tokens" integer NOT NULL DEFAULT 0,
  "output_tokens" integer NOT NULL DEFAULT 0,
  "total_tokens" integer NOT NULL DEFAULT 0,
  "finish_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ai_usage_input_tokens_check" CHECK ("input_tokens" >= 0),
  CONSTRAINT "ai_usage_output_tokens_check" CHECK ("output_tokens" >= 0),
  CONSTRAINT "ai_usage_total_tokens_check" CHECK ("total_tokens" >= 0)
);
CREATE INDEX IF NOT EXISTS "ai_usage_org_created_idx" ON "ai_usage" ("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_project_created_idx" ON "ai_usage" ("project_id", "created_at");
