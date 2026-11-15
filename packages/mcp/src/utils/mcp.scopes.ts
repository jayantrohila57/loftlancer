import type {
  McpOAuthScope,
  McpOAuthScopeConsentMessageKey,
} from "../constants/mcp.oauth-scopes"
import {
  MCP_BASE_SCOPE,
  MCP_OAUTH_SCOPES,
  mcpOAuthScopeConsentKeys,
  mcpProtectedResourceScopes,
} from "../constants/mcp.oauth-scopes"

export {
  MCP_BASE_SCOPE,
  MCP_OAUTH_SCOPES,
  type McpOAuthScope,
  type McpOAuthScopeConsentMessageKey,
  mcpOAuthScopeConsentKeys,
}

export function parseGrantedScopes(scopeClaim: unknown): Set<string> {
  if (typeof scopeClaim !== "string" || !scopeClaim.trim()) {
    return new Set()
  }
  return new Set(scopeClaim.split(/\s+/).filter(Boolean))
}

export function tokenHasScopes(
  granted: Set<string>,
  required: readonly string[]
): boolean {
  return required.every((scope) => granted.has(scope))
}

export function mcpToolNameFromAction(action: string): string {
  return action.replaceAll(".", "_")
}

export function actionFromMcpToolName(toolName: string): string | null {
  const candidate = toolName.replaceAll("_", ".")
  return candidate.length > 0 ? candidate : null
}

/**
 * Maps a dotted action id (e.g. `project.list`) to OAuth scopes for token checks.
 * Extend when product registers finer-grained MCP scopes on the auth plugin.
 */
export function requiredOAuthScopesForAction(action: string): string[] {
  const domain = action.split(".")[0] ?? ""

  if (domain === "resource" || domain === "mcp") {
    return [...mcpProtectedResourceScopes]
  }

  return [MCP_BASE_SCOPE]
}
