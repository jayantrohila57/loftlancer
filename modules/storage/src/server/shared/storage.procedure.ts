import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import type { StorageOrgContext } from "./storage.procedure.resolve"
import { resolveStorageOrgContext } from "./storage.procedure.resolve"

export type { StorageOrgContext }

export const storageOrgProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const { organizationId, orgRole, isOrgOwner } =
      await resolveStorageOrgContext(context.auth)

    return next({
      context: {
        ...context,
        /** Authoritative org scope for every storage oRPC call — never trust client org ids. */
        organizationId,
        orgRole,
        isOrgOwner,
      },
    })
  }
)
