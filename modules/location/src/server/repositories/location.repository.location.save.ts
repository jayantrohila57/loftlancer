import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import {
  activityLocation,
  securityActivity,
  user,
  userPermission,
} from "@packages/drizzle/schema"
import { and, desc, eq, gte } from "drizzle-orm"

export class StaleLocationGenerationError extends Error {}

export async function saveSessionLocation(
  userId: string,
  sessionId: string,
  location: {
    latitude: number
    longitude: number
    accuracyMeters: number
    generation: number
  }
) {
  const db = requireSecurityDb()
  return db.transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .for("no key update")
    const [preference] = await tx
      .select()
      .from(userPermission)
      .where(eq(userPermission.userId, userId))
      .for("update")
      .limit(1)
    if (!preference?.locationEnabled) return null
    if (preference.locationGeneration !== location.generation)
      throw new StaleLocationGenerationError()
    const [signIn] = await tx
      .select({ id: securityActivity.id })
      .from(securityActivity)
      .where(
        and(
          eq(securityActivity.userId, userId),
          eq(securityActivity.sessionId, sessionId),
          eq(securityActivity.type, "sign_in"),
          gte(securityActivity.occurredAt, new Date(Date.now() - 120000))
        )
      )
      .orderBy(desc(securityActivity.occurredAt))
      .limit(1)
    const [linked] = signIn
      ? await tx
          .select({ id: activityLocation.id })
          .from(activityLocation)
          .where(
            and(
              eq(activityLocation.userId, userId),
              eq(activityLocation.eventId, signIn.id)
            )
          )
          .limit(1)
      : []
    const [saved] = await tx
      .insert(activityLocation)
      .values({
        id: crypto.randomUUID(),
        userId,
        sessionId,
        source: "browser",
        eventId: linked ? null : (signIn?.id ?? null),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters,
      })
      .returning()
    return saved
  })
}
