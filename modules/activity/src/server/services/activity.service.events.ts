import { getDb } from "@packages/drizzle"
import { activityEvent, activityLocation, user } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { createError, createFailed, createSuccess } from "@packages/orpc"
import { and, desc, eq, gte, inArray, lt, lte, or, sql } from "drizzle-orm"
import { z } from "zod"
import { getActivityAction } from "../../utils/config/activity.actions"
import {
  parseActivityChangeValue,
  parseActivityMetadata,
  serializeUnifiedActivityItem,
} from "../../utils/serialization/activity.serialization"
import type {
  ActivityClearPayload,
  ActivityFeedQuery,
} from "../../utils/validation/activity.events.schema"
import type { ActivityTargetViewer } from "./activity.target-resolver"
import { resolveActivityTarget } from "./activity.target-resolver"

function db() {
  const result = getDb()
  if (!result) throw new Error("Database unavailable")
  return result
}
const cursorSchema = z
  .object({
    time: z.string().datetime(),
    id: z.string().min(1).max(256),
    filters: z.string().max(1500),
  })
  .strict()
function filtersFor(query: ActivityFeedQuery) {
  return JSON.stringify([
    query.scope ?? null,
    query.category ?? null,
    query.actionId ?? null,
    query.outcome ?? null,
    query.sourceModule ?? null,
    query.since ?? null,
    query.until ?? null,
  ])
}
function readCursor(query: ActivityFeedQuery) {
  if (!query.cursor) return null
  try {
    const parsed = cursorSchema.parse(
      JSON.parse(Buffer.from(query.cursor, "base64url").toString("utf8"))
    )
    if (parsed.filters !== filtersFor(query)) throw new Error("Filters changed")
    return parsed
  } catch {
    throw new InvalidCursorError()
  }
}
class InvalidCursorError extends Error {}
type Event = typeof activityEvent.$inferSelect
function project(
  event: Event,
  actor: { name: string | null; image: string | null },
  viewer: ActivityTargetViewer,
  visibility: "feed" | "detail"
) {
  const definition = getActivityAction(event.actionId)
  const metadata = parseActivityMetadata(event.actionId, event.metadata)
  const beforeValue = parseActivityChangeValue(
    event.actionId,
    event.beforeValue
  )
  const afterValue = parseActivityChangeValue(event.actionId, event.afterValue)
  const routeKey = event.target?.routeKey
  const resolved =
    definition &&
    resolveActivityTarget({
      routeKey,
      definitionTarget: definition.target,
      hasTargetParams: Boolean(event.target?.params || event.target?.anchor),
      category: event.category,
      viewer,
      eventMetadata:
        metadata && typeof metadata === "object"
          ? (metadata as Record<string, unknown>)
          : null,
    })
  const path = resolved?.path
  return serializeUnifiedActivityItem({
    event,
    actor,
    visibility,
    metadata,
    beforeValue,
    afterValue,
    canViewTarget: Boolean(path),
    targetUrl: path
      ? `${path}?activityId=${encodeURIComponent(event.activityId)}`
      : null,
  })
}
export const unifiedActivityService = {
  async feed(
    userId: string,
    query: ActivityFeedQuery,
    viewer: ActivityTargetViewer
  ) {
    try {
      const cursor = readCursor(query)
      const eventTime = sql<Date>`date_trunc('milliseconds', ${activityEvent.occurredAt})`
      const conditions = and(
        eq(activityEvent.ownerUserId, userId),
        query.scope
          ? inArray(
              activityEvent.category,
              query.scope === "account"
                ? ["account", "preferences", "privacy"]
                : query.scope === "security"
                  ? ["authentication", "security"]
                  : ["resource"]
            )
          : undefined,
        query.category ? eq(activityEvent.category, query.category) : undefined,
        query.actionId ? eq(activityEvent.actionId, query.actionId) : undefined,
        query.outcome ? eq(activityEvent.outcome, query.outcome) : undefined,
        query.sourceModule
          ? eq(activityEvent.sourceModule, query.sourceModule)
          : undefined,
        query.since
          ? gte(activityEvent.occurredAt, new Date(query.since))
          : undefined,
        query.until
          ? lte(activityEvent.occurredAt, new Date(query.until))
          : undefined,
        cursor
          ? or(
              lt(eventTime, new Date(cursor.time)),
              and(
                eq(eventTime, new Date(cursor.time)),
                lt(activityEvent.activityId, cursor.id)
              )
            )
          : undefined
      )
      const rows = await db()
        .select({
          event: activityEvent,
          actorName: user.name,
          actorImage: user.image,
        })
        .from(activityEvent)
        .leftJoin(user, eq(activityEvent.actorUserId, user.id))
        .where(conditions)
        .orderBy(desc(eventTime), desc(activityEvent.activityId))
        .limit(query.limit + 1)
      const page = rows.slice(0, query.limit)
      const last = page.at(-1)
      const nextCursor =
        rows.length > query.limit && last
          ? Buffer.from(
              JSON.stringify({
                time: last.event.occurredAt.toISOString(),
                id: last.event.activityId,
                filters: filtersFor(query),
              })
            ).toString("base64url")
          : null
      return createSuccess(
        {
          items: page.map((row) =>
            project(
              row.event,
              { name: row.actorName, image: row.actorImage },
              viewer,
              "feed"
            )
          ),
          nextCursor,
        },
        "Activity loaded."
      )
    } catch (error) {
      if (error instanceof InvalidCursorError)
        return createFailed("Invalid activity cursor.", {
          code: "INVALID_CURSOR",
        })
      logger.error("service.failed", {
        app: "auth",
        module: "activity",
        outcome: "error",
        errorCode: "ACTIVITY_UNAVAILABLE",
      })
      return createError("Could not load activity.", {
        code: "ACTIVITY_UNAVAILABLE",
      })
    }
  },
  async detail(
    userId: string,
    activityId: string,
    viewer: ActivityTargetViewer
  ) {
    try {
      const [row] = await db()
        .select({
          event: activityEvent,
          actorName: user.name,
          actorImage: user.image,
        })
        .from(activityEvent)
        .leftJoin(user, eq(activityEvent.actorUserId, user.id))
        .where(
          and(
            eq(activityEvent.ownerUserId, userId),
            eq(activityEvent.activityId, activityId)
          )
        )
        .limit(1)
      if (!row)
        return createFailed("Activity not found.", { code: "NOT_FOUND" })
      const [location] = await db()
        .select({
          latitude: activityLocation.latitude,
          longitude: activityLocation.longitude,
          accuracyMeters: activityLocation.accuracyMeters,
        })
        .from(activityLocation)
        .where(
          and(
            eq(activityLocation.userId, userId),
            eq(activityLocation.activityId, activityId)
          )
        )
        .limit(1)
      return createSuccess(
        {
          ...project(
            row.event,
            { name: row.actorName, image: row.actorImage },
            viewer,
            "detail"
          ),
          location: location ?? null,
        },
        "Activity loaded."
      )
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "activity",
        outcome: "error",
        errorCode: "ACTIVITY_UNAVAILABLE",
      })
      return createError("Could not load activity.", {
        code: "ACTIVITY_UNAVAILABLE",
      })
    }
  },
  async clear(userId: string, payload: ActivityClearPayload) {
    try {
      await db()
        .delete(activityEvent)
        .where(
          and(
            eq(activityEvent.ownerUserId, userId),
            payload.scope === "category"
              ? eq(activityEvent.category, payload.category)
              : payload.scope === "security"
                ? inArray(activityEvent.category, [
                    "authentication",
                    "security",
                  ])
                : payload.scope === "account"
                  ? inArray(activityEvent.category, [
                      "account",
                      "preferences",
                      "privacy",
                    ])
                  : undefined
          )
        )
      return createSuccess({ deleted: true }, "Activity history deleted.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "activity",
        outcome: "error",
        errorCode: "ACTIVITY_UNAVAILABLE",
      })
      return createError("Could not delete activity.", {
        code: "ACTIVITY_UNAVAILABLE",
      })
    }
  },
}
