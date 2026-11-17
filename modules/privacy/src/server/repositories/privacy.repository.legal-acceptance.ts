import { getDb } from "@packages/drizzle"
import { userLegalAcceptance } from "@packages/drizzle/schema"

export async function recordUserLegalAcceptance(input: {
  readonly userId: string
  readonly termsVersion: string
}) {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")

  await db
    .insert(userLegalAcceptance)
    .values({
      userId: input.userId,
      termsVersion: input.termsVersion,
    })
    .onConflictDoNothing()
}
