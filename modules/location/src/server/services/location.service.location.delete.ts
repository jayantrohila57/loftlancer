import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import {
  activityLocation,
  user,
  userPermission,
} from "@packages/drizzle/schema"
import { eq, sql } from "drizzle-orm"

export async function deleteLocationHistoryController(userId: string) {
  const activity = beginActivity({
    actionId: "privacy.location_history.delete",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })
  await requireSecurityDb().transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .for("no key update")
    await tx
      .insert(userPermission)
      .values({ userId, locationGeneration: 1 })
      .onConflictDoUpdate({
        target: userPermission.userId,
        set: {
          locationGeneration: sql`${userPermission.locationGeneration} + 1`,
        },
      })
    await tx.delete(activityLocation).where(eq(activityLocation.userId, userId))
    await recordActivity(
      activity,
      { outcome: "success", sourceApp: "auth", sourceModule: "location" },
      tx
    )
  })
  return { deleted: true }
}
