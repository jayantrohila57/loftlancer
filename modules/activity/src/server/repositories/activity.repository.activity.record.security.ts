import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import {
  activityEvent,
  activityLocation,
  securityActivity,
} from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, desc, eq, gte, isNull } from "drizzle-orm"

export async function recordSecurityActivity(event: {
  id?: string
  userId: string
  sessionId: string
  type:
    | "sign_in"
    | "sign_out"
    | "session_revoked"
    | "session_ended"
    | "provider_disconnected"
  ipAddress?: string | null
  userAgent?: string | null
  actorUserId?: string
}) {
  const id = event.id ?? crypto.randomUUID()
  await requireSecurityDb().transaction(async (db) => {
    const [recorded] = await db
      .insert(securityActivity)
      .values({
        id,
        userId: event.userId,
        sessionId: event.sessionId,
        type: event.type,
        outcome: "success",
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
      })
      .returning({ id: securityActivity.id })
    await db
      .update(activityEvent)
      .set({
        ...(event.actorUserId
          ? { actorType: "user" as const, actorUserId: event.actorUserId }
          : {}),
        target: {
          routeKey:
            event.type === "provider_disconnected"
              ? "account.providers"
              : "account.sessions",
        },
      })
      .where(
        and(
          eq(activityEvent.activityId, `legacy:security:${id}`),
          eq(activityEvent.ownerUserId, event.userId)
        )
      )
    if (event.type === "sign_out" && recorded) {
      const [location] = await db
        .select({ id: activityLocation.id })
        .from(activityLocation)
        .where(
          and(
            eq(activityLocation.userId, event.userId),
            eq(activityLocation.sessionId, event.sessionId),
            isNull(activityLocation.eventId),
            gte(activityLocation.capturedAt, new Date(Date.now() - 15000))
          )
        )
        .orderBy(desc(activityLocation.capturedAt))
        .limit(1)
      if (location)
        await db
          .update(activityLocation)
          .set({ eventId: recorded.id })
          .where(
            and(
              eq(activityLocation.id, location.id),
              eq(activityLocation.userId, event.userId),
              isNull(activityLocation.eventId)
            )
          )
    }
  })
  const actionId = {
    sign_in: "auth.sign_in",
    sign_out: "auth.sign_out",
    session_revoked: "auth.session.revoke",
    session_ended: "auth.session.end",
    provider_disconnected: "security.provider.unlink",
  }[event.type]
  logger.info("activity.recorded", {
    app: "auth",
    module: "security",
    actionId,
    activityId: `legacy:security:${id}`,
    outcome: "success",
  })
}
