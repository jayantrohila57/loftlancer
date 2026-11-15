import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { user, userPermission } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function setLocationPreference(userId: string, enabled: boolean) {
  const activity = beginActivity({
    actionId: "privacy.location_preference.update",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })
  return requireSecurityDb().transaction(async (tx) => {
    // Lock the owner to serialize first-time preference creation as well as updates.
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .for("no key update")
    const [previous] = await tx
      .select()
      .from(userPermission)
      .where(eq(userPermission.userId, userId))
      .limit(1)
    const now = new Date()
    const [value] = await tx
      .insert(userPermission)
      .values({
        userId,
        locationEnabled: enabled,
        locationDecisionAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userPermission.userId,
        set: {
          locationEnabled: enabled,
          locationDecisionAt: now,
          updatedAt: now,
        },
      })
      .returning()
    if (!previous || previous.locationEnabled !== enabled) {
      const before = previous?.locationEnabled ?? false
      await recordActivity(
        activity,
        {
          outcome: "success",
          sourceApp: "auth",
          sourceModule: "location",
          ...(before !== enabled && {
            beforeValue: { locationEnabled: before },
            afterValue: { locationEnabled: enabled },
          }),
        },
        tx
      )
    }
    return value
  })
}
