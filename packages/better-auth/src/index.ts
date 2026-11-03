export {
  DEFAULT_ACCOUNT_URL,
  DEFAULT_AUTH_URL,
  DEFAULT_MCP_URL,
  DEFAULT_STUDIO_URL,
  DEFAULT_WWW_URL,
  getPlatformProductionOrigins,
} from "./config/better-auth.platform-urls";
export { auth } from "./core/better-auth";
export {
  appendOttToUrl,
  isCrossOriginReturnTo,
  readOttFromSearchParams,
  stripOttFromPath,
} from "./core/better-auth.cross-app-session";
export { createPlatformAuth } from "./core/better-auth.platform";
export {
  type PlatformMiddlewareOptions,
  platformSessionMiddleware,
} from "./core/better-auth.platform-middleware";
export type { CreateSiblingAuthOptions } from "./core/better-auth.sibling";
export { createSiblingAuth } from "./core/better-auth.sibling";
export {
  evaluateSessionAccess,
  resolveSignInRedirect,
  type SessionAccessResult,
} from "./core/guards";
export type { AuthSession } from "./types/better-auth.session-types";
export { getSessionActiveOrganizationId } from "./types/better-auth.session-types";
export {
  absoluteReturnToFromRelativePath,
  validateReturnTo,
} from "./utils/better-auth.return-to";
