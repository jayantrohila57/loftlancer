export { APIError } from "better-auth/api"
export { getSessionCookie } from "better-auth/cookies"
export {
  type BetterAuthPlugin,
  createAuthMiddleware,
  getSessionFromCtx,
} from "./integration/better-auth.api"
export {
  type BetterAuthDatabaseHooks,
  type BetterAuthOrganizationPluginOptions,
  configureBetterAuth,
} from "./integration/better-auth.configure"
export {
  assertApprovedDeviceScopes,
  isApprovedDeviceClient,
  isApprovedDeviceScope,
  parseApprovedDeviceClientIds,
  parseApprovedDeviceScopes,
  resolveDeviceVerificationUri,
} from "./integration/better-auth.device-authorization"
export { createAuthRouteHandlers } from "./integration/better-auth.handlers"
export { withMcpProtectedResource } from "./integration/better-auth.mcp-protected"
export {
  oauthConsentDenyErrorCode,
  oauthConsentResponseIssuesAccess,
  readOAuthConsentRedirectError,
} from "./integration/better-auth.oauth-consent.deny"
export {
  assertPermittedOAuthConsentScopes,
  isPermittedOAuthConsentScope,
  parsePermittedOAuthConsentScopes,
  parseRequestedOAuthConsentScopes,
  resolveOAuthConsentGrantScopes,
} from "./integration/better-auth.oauth-consent.policy"
export { verifyOAuthConsentSearchParams } from "./integration/better-auth.oauth-consent.server"
export {
  mcpProtectedResourceScopes,
  resolveMcpResourceUrl,
} from "./integration/better-auth.oauth-mcp"
export {
  type McpOAuthScope,
  mcpAccessTokenTtlSeconds,
  mcpOAuthScopeConsentKeys,
  mcpOAuthScopes,
} from "./integration/better-auth.oauth-mcp.constants"
export { getTrustedAuthOrigins } from "./integration/better-auth.origins"
export { createAuth, getAuth } from "./integration/better-auth.server"
export {
  isSocialProviderConfigured,
  readSocialProviderAvailability,
  type SocialProviderAvailability,
  type SocialProviderId,
} from "./integration/better-auth.social-provider-availability"
export { DELETED_ACCOUNT_MESSAGE } from "./integration/better-auth.soft-delete"
