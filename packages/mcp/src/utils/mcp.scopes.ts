/**
 * OAuth/MCP scope helpers live in `@features/authorization/utils` (action registry).
 * Re-exported here for MCP wiring convenience.
 */
export {
  actionFromMcpToolName,
  MCP_BASE_SCOPE,
  MCP_OAUTH_SCOPES,
  type McpOAuthScope,
  mcpToolNameFromAction,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
} from "@features/authorization/utils";
