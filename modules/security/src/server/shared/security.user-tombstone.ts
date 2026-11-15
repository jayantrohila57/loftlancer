import { getDb } from "@packages/drizzle"
import { session, user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export const DELETED_ACCOUNT_MESSAGE =
  "This account was deleted and cannot be used again."

export function isUserTombstoned(record: {
  deletedAt?: Date | string | null
  deleted_at?: Date | string | null
}): boolean {
  return Boolean(record.deletedAt ?? record.deleted_at)
}

export async function tombstoneUserById(userId: string): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")
  const deletedAt = new Date()
  await db
    .update(user)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(eq(user.id, userId))
}

/**
 * Revokes every session row, then tombstones the user in one transaction.
 * Better Auth still attempts its own session/user deletes afterward; the user
 * hard-delete hook blocks removal while linked accounts are preserved.
 */
export async function tombstoneUserForDeletion(userId: string): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")
  const deletedAt = new Date()
  await db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.userId, userId))
    await tx
      .update(user)
      .set({ deletedAt, updatedAt: deletedAt })
      .where(eq(user.id, userId))
  })
}
