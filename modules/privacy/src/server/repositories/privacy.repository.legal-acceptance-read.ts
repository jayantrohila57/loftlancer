import { requireSecurityDb } from "@modules/security/server"
import { userLegalAcceptance } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function readUserLegalAcceptance(userId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(userLegalAcceptance)
    .where(eq(userLegalAcceptance.userId, userId))
    .limit(1)
  if (!row) return null
  return {
    termsVersion: row.termsVersion,
    acceptedAt: row.acceptedAt.toISOString(),
  }
}
