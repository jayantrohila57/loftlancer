import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import {
  activityEvent,
  activityLocation,
  securityActivity,
  userActivity,
} from "@packages/drizzle/schema"
import { and, eq, inArray } from "drizzle-orm"

export async function deleteAccountHistory(
  userId: string,
  kind: "location" | "user" | "security"
) {
  const db = requireSecurityDb()
  if (kind === "location")
    return db
      .delete(activityLocation)
      .where(eq(activityLocation.userId, userId))
  return db.transaction(async (tx) => {
    if (kind === "user") {
      await tx.delete(userActivity).where(eq(userActivity.userId, userId))
    } else {
      await tx
        .delete(securityActivity)
        .where(eq(securityActivity.userId, userId))
    }
    await tx
      .delete(activityEvent)
      .where(
        and(
          eq(activityEvent.ownerUserId, userId),
          inArray(
            activityEvent.category,
            kind === "user"
              ? ["account", "preferences"]
              : ["authentication", "security"]
          )
        )
      )
  })
}
