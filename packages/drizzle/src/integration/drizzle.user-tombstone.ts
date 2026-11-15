import { eq } from "drizzle-orm"

import { user } from "../schema/auth.schema"
import { getDb } from "./drizzle.client"

export async function readUserDeletedAt(
  userId: string
): Promise<Date | null | undefined> {
  const db = getDb()
  if (!db) return undefined
  const [row] = await db
    .select({ deletedAt: user.deletedAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return row?.deletedAt
}
