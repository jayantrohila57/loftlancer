import { ORPCError } from "@packages/orpc/server"

import { storageOrgProcedure } from "./storage.procedure"

export const storageOrgOwnerProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    if (!context.isOrgOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only organization owners can manage storage access.",
        data: { code: "rbac.org_owner_required" },
      })
    }
    return next({ context })
  }
)
