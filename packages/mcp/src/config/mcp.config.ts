import { serverEnv } from "@packages/t3-env/server"

import {
  DEFAULT_MCP_RATE_LIMIT,
  DEFAULT_MCP_REVEAL_RATE_LIMIT,
  DEFAULT_MCP_WRITE_RATE_LIMIT,
  MCP_WRITE_VERBS,
} from "../constants/mcp.constants"
import type { McpResourceAuthConfig, RateLimitConfig } from "../types/mcp.types"

function trimTrailingSlash(url: string) {
  return url.replace(/\/$/, "")
}

export function resolveMcpResourceUrl() {
  const explicit = serverEnv.MCP_RESOURCE_URL
  if (explicit) {
    return trimTrailingSlash(explicit)
  }
  const authAppUrl = new URL(serverEnv.BETTER_AUTH_URL)
  return trimTrailingSlash(new URL("api/mcp", `${authAppUrl.href}/`).href)
}

export function resolveMcpResourceAuthConfig(): McpResourceAuthConfig {
  const issuer = serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")
  const audience = resolveMcpResourceUrl()
  return {
    issuer,
    audience,
    jwksUrl: `${issuer}/api/auth/jwks`,
  }
}

function resolveMcpRateLimitConfigFromEnv(): RateLimitConfig {
  return {
    windowMs:
      serverEnv.MCP_RATE_LIMIT_WINDOW_MS ?? DEFAULT_MCP_RATE_LIMIT.windowMs,
    maxRequests:
      serverEnv.MCP_RATE_LIMIT_MAX_REQUESTS ??
      DEFAULT_MCP_RATE_LIMIT.maxRequests,
  }
}

function actionVerb(action: string): string {
  const parts = action.split(".")
  return parts[parts.length - 1] ?? "read"
}

/**
 * Per-action limits for MCP hardening: stricter on write/reveal/export.
 * `action` is a dotted action id (e.g. `variable.reveal`); only the verb is used.
 */
export function resolveMcpRateLimitConfig(action?: string): RateLimitConfig {
  const base = resolveMcpRateLimitConfigFromEnv()
  if (!action) {
    return base
  }
  const verb = actionVerb(action)
  if (verb === "reveal" || verb === "export") {
    return {
      windowMs: base.windowMs,
      maxRequests: Math.min(
        base.maxRequests,
        serverEnv.MCP_RATE_LIMIT_MAX_REVEAL ??
          DEFAULT_MCP_REVEAL_RATE_LIMIT.maxRequests
      ),
    }
  }
  if (MCP_WRITE_VERBS.has(verb)) {
    return {
      windowMs: base.windowMs,
      maxRequests: Math.min(
        base.maxRequests,
        serverEnv.MCP_RATE_LIMIT_MAX_WRITE ??
          DEFAULT_MCP_WRITE_RATE_LIMIT.maxRequests
      ),
    }
  }
  return base
}
