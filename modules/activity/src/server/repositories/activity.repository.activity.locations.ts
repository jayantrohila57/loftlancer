import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { activityLocation } from "@packages/drizzle/schema"
import { and, desc, eq, inArray } from "drizzle-orm"

export async function getActivityLocations(userId: string, eventIds: string[]) {
  if (eventIds.length === 0) return []
  return requireSecurityDb()
    .select({
      eventId: activityLocation.eventId,
      latitude: activityLocation.latitude,
      longitude: activityLocation.longitude,
      accuracyMeters: activityLocation.accuracyMeters,
      capturedAt: activityLocation.capturedAt,
    })
    .from(activityLocation)
    .where(
      and(
        eq(activityLocation.userId, userId),
        inArray(activityLocation.eventId, eventIds)
      )
    )
    .orderBy(desc(activityLocation.capturedAt))
}
