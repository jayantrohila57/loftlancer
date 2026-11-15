import { beginActivity, recordActivity } from "@modules/activity/server"
import { getAuth } from "@packages/better-auth"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import { assertPlatformAdministrator } from "../../utils/admin.authorization"
import type { listUsersInputSchema } from "../../utils/validation/admin.users.list.schema"

type ListUsersInput = z.infer<typeof listUsersInputSchema>

export async function listUsers(input: {
  headers: Headers
  auth: {
    user: {
      id: string
      email: string
      emailVerified: boolean
      role?: string | null
    }
  }
  query: ListUsersInput
}) {
  assertPlatformAdministrator(input.auth)
  const activity = beginActivity({
    actionId: "admin.users.list",
    ownerUserId: input.auth.user.id,
    actor: { type: "user", userId: input.auth.user.id },
  })
  try {
    const result = await getAuth().api.listUsers({
      headers: input.headers,
      query: {
        limit: input.query.limit,
        offset: input.query.offset,
        ...(input.query.searchValue
          ? {
              searchValue: input.query.searchValue,
              searchField: "email" as const,
              searchOperator: "contains" as const,
            }
          : {}),
      },
    })
    const payload = {
      users: result.users.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        emailVerified: item.emailVerified,
        role: item.role ?? null,
        banned: item.banned ?? false,
        createdAt: new Date(item.createdAt),
      })),
      total: result.total,
      limit: input.query.limit,
      offset: input.query.offset,
    }
    await recordActivity(activity, {
      outcome: "success",
      sourceApp: "auth",
      sourceModule: "admin",
      metadata: {
        limit: input.query.limit,
        offset: input.query.offset,
        total: result.total,
      },
    })
    return payload
  } catch (error) {
    await recordActivity(activity, {
      outcome: "failed",
      sourceApp: "auth",
      sourceModule: "admin",
      metadata: {
        limit: input.query.limit,
        offset: input.query.offset,
      },
    })
    if (error instanceof ORPCError) throw error
    throw new ORPCError("FORBIDDEN", { message: "Access denied." })
  }
}
