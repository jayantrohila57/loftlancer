import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { userPermission } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function getLocationPreference(userId: string) {
  const [value] = await requireSecurityDb()
    .select()
    .from(userPermission)
    .where(eq(userPermission.userId, userId))
    .limit(1)
  return value ?? null
}
