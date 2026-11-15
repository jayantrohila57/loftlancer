import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { activityEvent, userActivity } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq } from "drizzle-orm"

const userActivityActionIds = {
  profile_updated: "account.profile.update",
  avatar_updated: "account.avatar.update",
  avatar_removed: "account.avatar.remove",
  provider_disconnected: "security.provider.unlink",
} as const

export async function recordUserActivity(event: {
  id?: string
  userId: string
  type: keyof typeof userActivityActionIds
}) {
  const id = event.id ?? crypto.randomUUID()
  await requireSecurityDb().transaction(async (tx) => {
    await tx.insert(userActivity).values({
      id,
      userId: event.userId,
      type: event.type,
      outcome: "success",
      source: "account",
      resourceType: "account",
    })
    await tx
      .update(activityEvent)
      .set({
        actorType: "user",
        actorUserId: event.userId,
        target: {
          routeKey:
            event.type === "provider_disconnected"
              ? "account.providers"
              : "account.profile",
        },
      })
      .where(
        and(
          eq(activityEvent.activityId, `legacy:user:${id}`),
          eq(activityEvent.ownerUserId, event.userId)
        )
      )
  })
  logger.info("activity.recorded", {
    app: "auth",
    module: "profile",
    actionId: userActivityActionIds[event.type],
    activityId: `legacy:user:${id}`,
    outcome: "success",
  })
}
