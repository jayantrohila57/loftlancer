import { createFailed, createSuccess } from "@packages/orpc"

import {
  decodeStorageActivityCursor,
  encodeStorageActivityCursor,
} from "../../utils/storage.activity-cursor"
import { listOrgStorageActivity } from "../repositories/storage.repository.activity"
import { requireStorageDb } from "../repositories/storage.repository.db"

export async function listStorageActivityService(input: {
  organizationId: string
  cursor?: string
  limit?: number
}) {
  const db = requireStorageDb()
  const parsedCursor = decodeStorageActivityCursor(input.cursor)
  if (input.cursor && !parsedCursor) {
    return createFailed("Invalid activity cursor.", {
      code: "INVALID_INPUT",
    })
  }
  const rows = await listOrgStorageActivity({
    db,
    organizationId: input.organizationId,
    limit: input.limit,
    cursor: parsedCursor,
  })
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100)
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const last = page.at(-1)
  const nextCursor =
    hasMore && last
      ? encodeStorageActivityCursor({
          id: last.activityId,
          time: last.occurredAt.toISOString(),
        })
      : null
  return createSuccess(
    {
      events: page.map((event) => ({
        activityId: event.activityId,
        actionId: event.actionId,
        outcome: event.outcome,
        occurredAt: event.occurredAt,
        actorUserId: event.actorUserId,
        metadata: event.metadata ?? null,
      })),
      nextCursor,
    },
    "Storage activity loaded."
  )
}
