import { db } from "@loftlancer/db";
import { session } from "@loftlancer/db/schema/auth";
import { and, desc, eq, gt } from "drizzle-orm";

/** Active sessions owned by one authenticated user. */
export async function listActiveUserSessions(userId: string) {
  return db
    .select({
      id: session.id,
      token: session.token,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, new Date())))
    .orderBy(desc(session.updatedAt));
}
