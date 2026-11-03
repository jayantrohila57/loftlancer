/**
 * Model Context Protocol (`mcp-handler` + `@modelcontextprotocol/server`) glue.
 * Domain tool catalogs and execution live in `@loftlancer/orpc/mcp` → `module/`.
 */
export {
  resolveMcpRateLimitConfig,
  resolveMcpResourceAuthConfig,
} from "./config";
export {
  DEFAULT_MCP_RATE_LIMIT,
  DEFAULT_MCP_REVEAL_RATE_LIMIT,
  DEFAULT_MCP_WRITE_RATE_LIMIT,
  MCP_WRITE_VERBS,
} from "./constants";
export {
  assertTokenScopesForAction,
  createMcpResourceHandler,
  createMcpSdkHttpHandler,
  getOAuthClientIdFromClaims,
  getUserIdFromClaims,
  McpInsufficientScopeError,
} from "./core";
export type {
  McpResourceAuthConfig,
  McpToolRegistrar,
  RateLimitConfig,
  RateLimitResult,
} from "./types";
export {
  actionFromMcpToolName,
  consumeRateLimit,
  MCP_BASE_SCOPE,
  MCP_OAUTH_SCOPES,
  type McpOAuthScope,
  mcpCorsHeadersForRequest,
  mcpCorsPreflightResponse,
  mcpRateLimitKey,
  mcpToolNameFromAction,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
  withMcpCors,
} from "./utils";
