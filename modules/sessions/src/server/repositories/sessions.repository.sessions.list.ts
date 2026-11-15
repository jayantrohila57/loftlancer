import { getDb } from "@packages/drizzle"
import { session } from "@packages/drizzle/schema"
import { and, eq, gt } from "drizzle-orm"

export async function listAccountSessions(userId: string) {
  const db = getDb()
  if (!db) return null
  return db
    .select({
      id: session.id,
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, new Date())))
}
