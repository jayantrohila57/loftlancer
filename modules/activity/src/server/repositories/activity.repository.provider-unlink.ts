import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import {
  activityEvent,
  securityActivity,
  userActivity,
} from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq } from "drizzle-orm"

/** Both compatibility views reference a single canonical security event. */
export async function recordProviderUnlink(event: {
  id?: string
  userId: string
  sessionId: string
  actorUserId: string
  ipAddress?: string | null
  userAgent?: string | null
}) {
  const id = event.id ?? crypto.randomUUID()
  await requireSecurityDb().transaction(async (tx) => {
    await tx.insert(securityActivity).values({
      id,
      userId: event.userId,
      sessionId: event.sessionId,
      type: "provider_disconnected",
      outcome: "success",
      ipAddress: event.ipAddress ?? null,
      userAgent: event.userAgent ?? null,
    })
    await tx
      .update(activityEvent)
      .set({
        actorType: "user",
        actorUserId: event.actorUserId,
        target: { routeKey: "account.providers" },
      })
      .where(
        and(
          eq(activityEvent.activityId, `legacy:security:${id}`),
          eq(activityEvent.ownerUserId, event.userId)
        )
      )
    await tx.insert(userActivity).values({
      id,
      userId: event.userId,
      type: "provider_disconnected",
      outcome: "success",
      source: "account",
      resourceType: "account",
      metadata: { mirrorSecurityId: id },
    })
  })
  logger.info("activity.recorded", {
    app: "auth",
    module: "security",
    actionId: "security.provider.unlink",
    activityId: `legacy:security:${id}`,
    outcome: "success",
  })
}
