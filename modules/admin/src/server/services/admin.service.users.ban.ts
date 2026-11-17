import { beginActivity, recordActivity } from "@modules/activity/server"
import { getAuth } from "@packages/better-auth"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import { assertPlatformAdministrator } from "../../utils/admin.authorization"
import type { banUserInputSchema } from "../../utils/validation/admin.users.ban.schema"

type BanUserInput = z.infer<typeof banUserInputSchema>

export async function banUser(input: {
  headers: Headers
  auth: {
    user: {
      id: string
      email: string
      emailVerified: boolean
      role?: string | null
    }
  }
  body: BanUserInput
}) {
  assertPlatformAdministrator(input.auth)
  const activity = beginActivity({
    actionId: "admin.users.ban",
    ownerUserId: input.auth.user.id,
    actor: { type: "user", userId: input.auth.user.id },
  })
  try {
    const banExpiresIn =
      input.body.banExpiresAt != null
        ? Math.max(
            1,
            Math.floor((input.body.banExpiresAt.getTime() - Date.now()) / 1000)
          )
        : undefined
    await getAuth().api.banUser({
      headers: input.headers,
      body: {
        userId: input.body.userId,
        banReason: input.body.banReason,
        ...(banExpiresIn ? { banExpiresIn } : {}),
      },
    })
    await getAuth().api.revokeUserSessions({
      headers: input.headers,
      body: { userId: input.body.userId },
    })
    await recordActivity(activity, {
      outcome: "success",
      sourceApp: "console",
      sourceModule: "admin",
      metadata: {
        banExpiresIn: banExpiresIn ?? null,
        hasReason: Boolean(input.body.banReason),
      },
    })
    return { userId: input.body.userId, banned: true }
  } catch (error) {
    await recordActivity(activity, {
      outcome: "failed",
      sourceApp: "console",
      sourceModule: "admin",
    })
    if (error instanceof ORPCError) throw error
    throw new ORPCError("BAD_REQUEST", { message: "Could not ban user." })
  }
}
