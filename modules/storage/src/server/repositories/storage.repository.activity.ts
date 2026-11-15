import { activityEvent } from "@packages/drizzle/schema"
import { and, desc, eq, lt, or, sql } from "drizzle-orm"

import type { StorageActivityCursor } from "../../utils/storage.activity-cursor"
import type { StorageOrgDb } from "./storage.repository.db"

export async function listOrgStorageActivity(input: {
  db: StorageOrgDb
  organizationId: string
  limit?: number
  cursor?: StorageActivityCursor | null
}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100)
  const filters = [
    sql`${activityEvent.actionId} like 'storage.%'`,
    sql`${activityEvent.metadata}->>'organizationId' = ${input.organizationId}`,
  ]
  if (input.cursor) {
    const cursorTime = new Date(input.cursor.time)
    const cursorFilter = or(
      lt(activityEvent.occurredAt, cursorTime),
      and(
        eq(activityEvent.occurredAt, cursorTime),
        lt(activityEvent.activityId, input.cursor.id)
      )
    )
    if (cursorFilter) filters.push(cursorFilter)
  }
  return input.db
    .select({
      activityId: activityEvent.activityId,
      actionId: activityEvent.actionId,
      outcome: activityEvent.outcome,
      occurredAt: activityEvent.occurredAt,
      actorUserId: activityEvent.actorUserId,
      metadata: activityEvent.metadata,
    })
    .from(activityEvent)
    .where(and(...filters))
    .orderBy(desc(activityEvent.occurredAt), desc(activityEvent.activityId))
    .limit(limit + 1)
}
