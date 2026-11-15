import { storageOrgProcedure } from "@modules/storage/server"
import { ORPCError } from "@packages/orpc/server"

export const aiUsageOrgOwnerProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    if (!context.isOrgOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only organization owners can change AI usage alerts.",
        data: { code: "rbac.org_owner_required" },
      })
    }
    return next({ context })
  }
)
