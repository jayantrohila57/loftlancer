import { resolveAuthServiceUrl } from "@loftlancer/t3-env/vercel-services";

import {
  DEFAULT_MCP_RATE_LIMIT,
  DEFAULT_MCP_REVEAL_RATE_LIMIT,
  DEFAULT_MCP_WRITE_RATE_LIMIT,
  MCP_WRITE_VERBS,
} from "../constants/mcp.constants";
import type {
  McpResourceAuthConfig,
  RateLimitConfig,
} from "../types/mcp.types";

export function resolveMcpResourceAuthConfig(): McpResourceAuthConfig {
  const authUrl = (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_AUTH_URL ??
    resolveAuthServiceUrl()
  ).replace(/\/$/, "");

  const audience = (
    process.env.MCP_RESOURCE_URL ??
    process.env.NEXT_PUBLIC_MCP_URL ??
    "https://loftlancer.com"
  ).replace(/\/$/, "");
  const resource = audience.endsWith("/api/mcp")
    ? audience
    : `${audience}/api/mcp`;

  return {
    issuer: authUrl,
    audience: resource,
    jwksUrl: `${authUrl}/api/auth/jwks`,
  };
}

function readIntEnv(key: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[key] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveMcpRateLimitConfigFromEnv(): RateLimitConfig {
  const windowMs = Number.parseInt(
    process.env.MCP_RATE_LIMIT_WINDOW_MS ?? "",
    10,
  );
  const maxRequests = Number.parseInt(
    process.env.MCP_RATE_LIMIT_MAX_REQUESTS ?? "",
    10,
  );
  return {
    windowMs:
      Number.isFinite(windowMs) && windowMs > 0
        ? windowMs
        : DEFAULT_MCP_RATE_LIMIT.windowMs,
    maxRequests:
      Number.isFinite(maxRequests) && maxRequests > 0
        ? maxRequests
        : DEFAULT_MCP_RATE_LIMIT.maxRequests,
  };
}

function actionVerb(action: string): string {
  const parts = action.split(".");
  return parts[parts.length - 1] ?? "read";
}

/**
 * Per-action limits for MCP hardening: stricter on write/reveal/export.
 * `action` is a dotted action id (e.g. `variable.reveal`); only the verb is used.
 */
export function resolveMcpRateLimitConfig(action?: string): RateLimitConfig {
  const base = resolveMcpRateLimitConfigFromEnv();
  if (!action) {
    return base;
  }
  const verb = actionVerb(action);
  if (verb === "reveal" || verb === "export") {
    return {
      windowMs: base.windowMs,
      maxRequests: Math.min(
        base.maxRequests,
        readIntEnv(
          "MCP_RATE_LIMIT_MAX_REVEAL",
          DEFAULT_MCP_REVEAL_RATE_LIMIT.maxRequests,
        ),
      ),
    };
  }
  if (MCP_WRITE_VERBS.has(verb)) {
    return {
      windowMs: base.windowMs,
      maxRequests: Math.min(
        base.maxRequests,
        readIntEnv(
          "MCP_RATE_LIMIT_MAX_WRITE",
          DEFAULT_MCP_WRITE_RATE_LIMIT.maxRequests,
        ),
      ),
    };
  }
  return base;
}
