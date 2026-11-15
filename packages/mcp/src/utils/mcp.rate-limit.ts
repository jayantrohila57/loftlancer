import type { RateLimitConfig } from "../types/mcp.types"

export function mcpRateLimitKey(parts: {
  oauthClientId?: string | null
  userId?: string | null
  toolName?: string
}): string {
  const client = parts.oauthClientId ?? "anonymous"
  const user = parts.userId ?? "anonymous"
  const tool = parts.toolName ?? "route"
  return `mcp:${client}:${user}:${tool}`
}

export function mergeRateLimitWindow(
  base: RateLimitConfig,
  maxRequests: number
): RateLimitConfig {
  return {
    windowMs: base.windowMs,
    maxRequests: Math.min(base.maxRequests, maxRequests),
  }
}
