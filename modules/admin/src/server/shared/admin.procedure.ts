import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { ORPCError } from "@packages/orpc/server"

import { assertPlatformAdministrator } from "../../utils/admin.authorization"

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    try {
      assertPlatformAdministrator({ user: context.auth.user })
    } catch (error) {
      if (error instanceof ORPCError && error.code === "FORBIDDEN")
        throw new ORPCError("FORBIDDEN", { message: "Access denied." })
      throw error
    }
    return next()
  }
)
