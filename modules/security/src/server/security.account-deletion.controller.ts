import { createSuccess } from "@packages/orpc"
import { serverEnv } from "@packages/t3-env/server"
import { securityAccountDeletionRoutes } from "../utils/config/security.account-deletion.routes"
import { accountDeletionStatusResponseSchema } from "../utils/validation/security.account-deletion.schema"
import { listOwnedOrganizationsForDeletion } from "./shared/security.account-deletion.orchestration"
import { protectedProcedure } from "./shared/security.procedure"

function studioSettingsOwnershipPath(slug: string) {
  const development = serverEnv.NODE_ENV !== "production"
  const studioBase = (
    serverEnv.STUDIO_APP_URL ??
    (development
      ? "http://localhost:3003"
      : new URL("/studio", serverEnv.BETTER_AUTH_URL).toString())
  ).replace(/\/$/, "")
  return `${studioBase}/en-us/settings/${slug}/ownership`
}

export const securityAccountDeletionController = {
  status: protectedProcedure
    .route(securityAccountDeletionRoutes.status)
    .output(accountDeletionStatusResponseSchema)
    .handler(async ({ context }) => {
      const owned = await listOwnedOrganizationsForDeletion(
        context.auth.user.id
      )
      const blockers = owned
        .filter((org) => org.otherMemberCount > 0)
        .map((org) => ({
          organizationId: org.organizationId,
          name: org.name,
          slug: org.slug,
          otherMemberCount: org.otherMemberCount,
          settingsPath: studioSettingsOwnershipPath(org.slug),
        }))
      const data = {
        blockers,
        canDelete: blockers.length === 0,
      }
      return accountDeletionStatusResponseSchema.parse(
        createSuccess(data, "Account deletion status loaded.")
      )
    }),
}
