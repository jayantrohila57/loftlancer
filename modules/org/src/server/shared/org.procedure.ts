import { protectedProcedure } from "../../../../security/src/server/shared/security.procedure"
import type { ActiveOrgMembershipContext } from "./org.membership-context"
import { resolveActiveOrgMembershipContext } from "./org.membership-context"

export type OrgProcedureContext = ActiveOrgMembershipContext

export const orgProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const { organizationId, orgRole, isOrgOwner } =
      await resolveActiveOrgMembershipContext(context.auth)

    return next({
      context: {
        ...context,
        organizationId,
        orgRole,
        isOrgOwner,
      },
    })
  }
)
