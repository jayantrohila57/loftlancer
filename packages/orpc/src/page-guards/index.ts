export {
  PageForbiddenError,
  PageNotFoundError,
} from "@features/authentication/core/server/authentication.page-guards-next/errors";
export {
  applyPageGuardError,
  redirectToForbidden,
  runPageGuard,
} from "@features/authentication/core/server/authentication.page-guards-next/next";
export { requirePageAction } from "@features/authorization/core/server/page-guards/authorization.require-page-action";
export {
  requireSupportManagerPage,
  requireSupportTicketPage,
} from "@modules/support/server/server.support-page-guards";
export { requireConsoleOperatorPage } from "./console";
export {
  organizationChildAction,
  organizationChildRouteActions,
} from "./org-route-actions";
export {
  assertOrganizationTeamForPage,
  assertProjectEnvironmentForPage,
  assertProjectTaskForPage,
  type ResolvedOrganization,
  type ResolvedProject,
  resolveOrganizationForPage,
  resolveProjectForPage,
} from "./resources";
