export { securityRouter } from "./security.router"
export { buildSecurityAuthDatabaseHooks } from "./shared/security.auth-database-hooks"
export {
  getCompatibilitySession,
  invalidOrigin,
  unauthorized,
  validOrigin,
} from "./shared/security.compatibility"
export { getSecurityDb, requireSecurityDb } from "./shared/security.db"
export { buildSecurityDeleteUserCallbacks } from "./shared/security.delete-user"
export { buildDeviceAuthorizationActivityPlugin } from "./shared/security.device-authorization-activity"
export { protectedProcedure } from "./shared/security.procedure"
export {
  DELETED_ACCOUNT_MESSAGE,
  isUserTombstoned,
  tombstoneUserById,
} from "./shared/security.user-tombstone"
