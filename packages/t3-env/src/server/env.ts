import { createEnv } from "@t3-oss/env-core"
import { config as loadDotenv } from "dotenv"
import { z } from "zod"

import { encryptionKeySchema } from "./encryption-key.schema"
import { serverEnvFile } from "./paths"

if (process.env.NEXT_RUNTIME !== "edge") {
  loadDotenv({ path: serverEnvFile, quiet: true })
}

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true"

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url().optional(),
    CONSOLE_ADMIN_EMAILS: z.string().optional(),
    STUDIO_APP_URL: z.url().optional(),
    CONSOLE_APP_URL: z.url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.url().default("http://localhost:3002/auth"),
    APP_PUBLIC_URL: z.url().default("http://localhost:3001"),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().min(1).optional(),
    MCP_RESOURCE_URL: z.url().optional(),
    MCP_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
    MCP_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().optional(),
    MCP_RATE_LIMIT_MAX_WRITE: z.coerce.number().int().positive().optional(),
    MCP_RATE_LIMIT_MAX_REVEAL: z.coerce.number().int().positive().optional(),
    OAUTH_TRUSTED_CLIENT_IDS: z.string().optional(),
    BETTER_AUTH_DEVICE_CLIENT_IDS: z.string().optional(),
    BETTER_AUTH_DEVICE_SCOPES: z.string().optional(),
    BETTER_AUTH_DEVICE_VERIFICATION_URL: z.url().optional(),
    /** Autumn server API (`am_sk_…`). Required for org billing in local dev per autumn-usage-metering. */
    AUTUMN_SECRET_KEY: z.string().min(1).optional(),
    /** Self-hosted Autumn API origin (not Autumn cloud). Default: local OSS server port. */
    AUTUMN_API_BASE_URL: z.string().url().default("http://localhost:4002"),
    /** Autumn dashboard signing secret for inbound webhooks (self-hosted instance). */
    AUTUMN_WEBHOOK_SECRET: z.string().min(1).optional(),
    /** Autumn plan id for Free tier (dashboard). */
    AUTUMN_PLAN_ID_FREE: z.string().min(1).optional(),
    /** Autumn plan id for Paid tier (dashboard). */
    AUTUMN_PLAN_ID_PAID: z.string().min(1).optional(),
    /** Autumn `x-api-version` header for self-hosted OSS (max on server may be below SDK default). */
    AUTUMN_X_API_VERSION: z.string().min(1).optional(),
    /** Mailto target for Account → Help & support → Contact (batch E2). */
    SUPPORT_EMAIL: z.string().email().optional(),
    /**
     * Tracing backend. `otel` exports via `@packages/observability`; `sentry`
     * keeps performance traces on Sentry only (OTel SDK stays off).
     */
    OBSERVABILITY_TRACING_PROVIDER: z
      .enum(["none", "otel", "sentry"])
      .default("none"),
    OBSERVABILITY_TRACING_ENABLED: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().url().optional(),
    OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
    OTEL_SERVICE_NAME: z.string().min(1).optional(),
    /** Sentry — optional until observability is configured. */
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    /**
     * Guard token for optional `/api/sentry-test` routes (32+ chars enforced in
     * `@packages/sentry/test`). Unset fails closed (404).
     */
    SENTRY_TEST_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().default("0.0.1"),
    /**
     * AES-256-GCM key (`openssl rand -hex 32`). Optional in dev; required when
     * using `@packages/crypto/server`. Skipped entirely when
     * `SKIP_ENV_VALIDATION=true`.
     */
    ENCRYPTION_KEY: encryptionKeySchema.optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CONSOLE_ADMIN_EMAILS: process.env.CONSOLE_ADMIN_EMAILS,
    STUDIO_APP_URL: process.env.STUDIO_APP_URL,
    CONSOLE_APP_URL: process.env.CONSOLE_APP_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    APP_PUBLIC_URL: process.env.APP_PUBLIC_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    MCP_RESOURCE_URL: process.env.MCP_RESOURCE_URL,
    MCP_RATE_LIMIT_WINDOW_MS: process.env.MCP_RATE_LIMIT_WINDOW_MS,
    MCP_RATE_LIMIT_MAX_REQUESTS: process.env.MCP_RATE_LIMIT_MAX_REQUESTS,
    MCP_RATE_LIMIT_MAX_WRITE: process.env.MCP_RATE_LIMIT_MAX_WRITE,
    MCP_RATE_LIMIT_MAX_REVEAL: process.env.MCP_RATE_LIMIT_MAX_REVEAL,
    OAUTH_TRUSTED_CLIENT_IDS: process.env.OAUTH_TRUSTED_CLIENT_IDS,
    BETTER_AUTH_DEVICE_CLIENT_IDS: process.env.BETTER_AUTH_DEVICE_CLIENT_IDS,
    BETTER_AUTH_DEVICE_SCOPES: process.env.BETTER_AUTH_DEVICE_SCOPES,
    BETTER_AUTH_DEVICE_VERIFICATION_URL:
      process.env.BETTER_AUTH_DEVICE_VERIFICATION_URL,
    AUTUMN_SECRET_KEY: process.env.AUTUMN_SECRET_KEY,
    AUTUMN_API_BASE_URL: process.env.AUTUMN_API_BASE_URL,
    AUTUMN_WEBHOOK_SECRET: process.env.AUTUMN_WEBHOOK_SECRET,
    AUTUMN_PLAN_ID_FREE: process.env.AUTUMN_PLAN_ID_FREE,
    AUTUMN_PLAN_ID_PAID: process.env.AUTUMN_PLAN_ID_PAID,
    AUTUMN_X_API_VERSION: process.env.AUTUMN_X_API_VERSION,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    OBSERVABILITY_TRACING_PROVIDER: process.env.OBSERVABILITY_TRACING_PROVIDER,
    OBSERVABILITY_TRACING_ENABLED: process.env.OBSERVABILITY_TRACING_ENABLED,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_TEST_TOKEN: process.env.SENTRY_TEST_TOKEN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation,
})
