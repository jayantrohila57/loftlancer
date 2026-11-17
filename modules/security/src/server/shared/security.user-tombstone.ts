import { getDb } from "@packages/drizzle"
import { session, user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

import { buildDeletedUserEmailPlaceholder } from "../../utils/constants/security.constants.deleted-email"

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
 * Revokes every session row, tombstones the user, and rewrites email so the
 * address can be registered again.
 */
export async function tombstoneUserForDeletion(
  userId: string,
  input?: { readonly rewriteEmail?: boolean }
): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")
  const deletedAt = new Date()
  const placeholderEmail =
    input?.rewriteEmail === false
      ? undefined
      : buildDeletedUserEmailPlaceholder(userId)

  await db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.userId, userId))
    await tx
      .update(user)
      .set({
        deletedAt,
        updatedAt: deletedAt,
        ...(placeholderEmail ? { email: placeholderEmail } : {}),
      })
      .where(eq(user.id, userId))
  })
}
