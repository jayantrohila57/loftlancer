import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { activityLocation } from "@packages/drizzle/schema"
import { and, desc, eq } from "drizzle-orm"

export async function getSessionLocation(userId: string, sessionId: string) {
  const [location] = await requireSecurityDb()
    .select()
    .from(activityLocation)
    .where(
      and(
        eq(activityLocation.userId, userId),
        eq(activityLocation.sessionId, sessionId)
      )
    )
    .orderBy(desc(activityLocation.capturedAt))
    .limit(1)
  return location ?? null
}
