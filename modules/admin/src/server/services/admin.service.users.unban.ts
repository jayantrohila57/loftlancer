import { beginActivity, recordActivity } from "@modules/activity/server"
import { getAuth } from "@packages/better-auth"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import { assertPlatformAdministrator } from "../../utils/admin.authorization"
import type { unbanUserInputSchema } from "../../utils/validation/admin.users.ban.schema"

type UnbanUserInput = z.infer<typeof unbanUserInputSchema>

export async function unbanUser(input: {
  headers: Headers
  auth: {
    user: {
      id: string
      email: string
      emailVerified: boolean
      role?: string | null
    }
  }
  body: UnbanUserInput
}) {
  assertPlatformAdministrator(input.auth)
  const activity = beginActivity({
    actionId: "admin.users.unban",
    ownerUserId: input.auth.user.id,
    actor: { type: "user", userId: input.auth.user.id },
  })
  try {
    await getAuth().api.unbanUser({
      headers: input.headers,
      body: { userId: input.body.userId },
    })
    await recordActivity(activity, {
      outcome: "success",
      sourceApp: "console",
      sourceModule: "admin",
    })
    return { userId: input.body.userId, banned: false }
  } catch (error) {
    await recordActivity(activity, {
      outcome: "failed",
      sourceApp: "console",
      sourceModule: "admin",
    })
    if (error instanceof ORPCError) throw error
    throw new ORPCError("BAD_REQUEST", { message: "Could not unban user." })
  }
}
