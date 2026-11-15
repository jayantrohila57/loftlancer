import { APIError } from "better-auth/api"
import type { McpOAuthScope } from "./better-auth.oauth-mcp.constants"
import { mcpOAuthScopes } from "./better-auth.oauth-mcp.constants"

/** Split a space-delimited OAuth `scope` parameter into requested scope names. */
export function parseRequestedOAuthConsentScopes(
  scope: string | undefined
): readonly string[] {
  if (!scope?.trim()) return []
  return scope.split(/\s+/).filter(Boolean)
}

export function parsePermittedOAuthConsentScopes(
  allowed: readonly string[] = mcpOAuthScopes
): ReadonlySet<string> {
  return new Set(allowed)
}

/** True when every requested scope is on the MCP OAuth allowlist. */
export function isPermittedOAuthConsentScope(
  scope: string | undefined,
  allowed: readonly string[] = mcpOAuthScopes
): boolean {
  const requested = parseRequestedOAuthConsentScopes(scope)
  if (requested.length === 0) return true
  const permitted = parsePermittedOAuthConsentScopes(allowed)
  return requested.every((entry) => permitted.has(entry))
}

/**
 * Scopes the authorization server may grant on consent approval: the intersection
 * of the signed request and the configured allowlist, in request order (deduped).
 */
export function resolveOAuthConsentGrantScopes(
  scope: string | undefined,
  allowed: readonly McpOAuthScope[] = mcpOAuthScopes
): readonly McpOAuthScope[] {
  const requested = parseRequestedOAuthConsentScopes(scope)
  if (requested.length === 0) return []
  if (!isPermittedOAuthConsentScope(scope, allowed)) return []
  const permitted = parsePermittedOAuthConsentScopes(allowed)
  const granted: McpOAuthScope[] = []
  const seen = new Set<string>()
  for (const entry of requested) {
    if (!permitted.has(entry) || seen.has(entry)) continue
    seen.add(entry)
    granted.push(entry as McpOAuthScope)
  }
  return granted
}

export function assertPermittedOAuthConsentScopes(
  scope: string | undefined,
  allowed: readonly string[] = mcpOAuthScopes
): void {
  if (isPermittedOAuthConsentScope(scope, allowed)) return
  throw new APIError("BAD_REQUEST", {
    error: "invalid_scope",
    error_description: "One or more requested scopes are not allowed",
  })
}
