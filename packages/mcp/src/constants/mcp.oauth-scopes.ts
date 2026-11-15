/** OAuth scopes exposed to MCP and first-party clients (`@packages/better-auth` plugin). */
export const mcpOAuthScopes = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "mcp:tools",
  "mcp:resources",
] as const

export type McpOAuthScope = (typeof mcpOAuthScopes)[number]

/** Human-readable consent copy keyed by scope (i18n message keys in apps/auth). */
export const mcpOAuthScopeConsentKeys = {
  openid: "mcpScopeOpenId",
  profile: "mcpScopeProfile",
  email: "mcpScopeEmail",
  offline_access: "mcpScopeOfflineAccess",
  "mcp:tools": "mcpScopeTools",
  "mcp:resources": "mcpScopeResources",
} as const satisfies Record<McpOAuthScope, string>

export type McpOAuthScopeConsentMessageKey =
  (typeof mcpOAuthScopeConsentKeys)[McpOAuthScope]

/** Scopes required to call the protected MCP resource route. */
export const mcpProtectedResourceScopes = [
  "mcp:tools",
  "mcp:resources",
] as const

export const MCP_BASE_SCOPE = mcpProtectedResourceScopes[0]

export const MCP_OAUTH_SCOPES = mcpOAuthScopes

/** Default access-token lifetime for the MCP protected resource (seconds). */
export const mcpAccessTokenTtlSeconds = 60 * 60

/** Default locale used in OAuth login/consent redirects (auth app default). */
export const mcpOAuthDefaultLocale = "en-us"
