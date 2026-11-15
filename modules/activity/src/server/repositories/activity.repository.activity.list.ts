import { requireSecurityDb } from "@modules/security/server/shared/security.db"
import { securityActivity, userActivity } from "@packages/drizzle/schema"
import { and, desc, eq, gte } from "drizzle-orm"

export async function listAccountActivity(
  userId: string,
  kind: "user" | "security",
  limit: number,
  offset: number,
  filters: { type?: string; since?: Date } = {}
) {
  const table = kind === "user" ? userActivity : securityActivity
  return requireSecurityDb()
    .select()
    .from(table)
    .where(
      and(
        eq(table.userId, userId),
        filters.type ? eq(table.type, filters.type) : undefined,
        filters.since ? gte(table.occurredAt, filters.since) : undefined
      )
    )
    .orderBy(desc(table.occurredAt), desc(table.id))
    .limit(limit)
    .offset(offset)
}
