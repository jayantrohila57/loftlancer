import type { BetterAuthDatabaseHooks as DatabaseHooks } from "@packages/better-auth"
import { getDb } from "@packages/drizzle"
import { user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

import { resolvePlatformAdminRole } from "../../utils/admin.authorization"

async function syncUserPlatformRole(userId: string) {
  const db = getDb()
  if (!db) return
  const [record] = await db
    .select({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  if (!record) return
  const nextRole = resolvePlatformAdminRole(record)
  if (nextRole === (record.role ?? "user")) return
  await db.update(user).set({ role: nextRole }).where(eq(user.id, userId))
}

export function buildAdminAuthDatabaseHooks(): DatabaseHooks {
  return {
    user: {
      create: {
        after: async (createdUser) => {
          await syncUserPlatformRole(createdUser.id)
        },
      },
      update: {
        after: async (updatedUser) => {
          await syncUserPlatformRole(updatedUser.id)
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          await syncUserPlatformRole(session.userId)
        },
      },
    },
  }
}
