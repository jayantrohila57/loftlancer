/**
 * Shared MCP scope and tool-naming helpers (safe for client bundles).
 * HTTP handlers and JWT verification: `@packages/mcp/server`.
 */
export {
  DEFAULT_MCP_RATE_LIMIT,
  DEFAULT_MCP_REVEAL_RATE_LIMIT,
  DEFAULT_MCP_WRITE_RATE_LIMIT,
  MCP_WRITE_VERBS,
} from "./constants/mcp.constants"
export {
  mcpAccessTokenTtlSeconds,
  mcpOAuthDefaultLocale,
  mcpOAuthScopes,
  mcpProtectedResourceScopes,
} from "./constants/mcp.oauth-scopes"
export type {
  McpResourceAuthConfig,
  McpToolRegistrar,
  RateLimitConfig,
  RateLimitResult,
} from "./types/mcp.types"
export { mcpRateLimitKey, mergeRateLimitWindow } from "./utils/mcp.rate-limit"
export {
  actionFromMcpToolName,
  MCP_BASE_SCOPE,
  MCP_OAUTH_SCOPES,
  type McpOAuthScope,
  type McpOAuthScopeConsentMessageKey,
  mcpOAuthScopeConsentKeys,
  mcpToolNameFromAction,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
} from "./utils/mcp.scopes"
