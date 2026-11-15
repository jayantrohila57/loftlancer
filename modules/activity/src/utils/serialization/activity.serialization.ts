import type { activityEvent } from "@packages/drizzle/schema"
import { getActivityAction } from "../config/activity.actions"

type ActivityRow = typeof activityEvent.$inferSelect

export type ActivityClientVisibility = "feed" | "detail"

/** Parsed metadata only when the registered action schema accepts the stored JSON. */
export function parseActivityMetadata(
  actionId: string,
  raw: unknown
): Record<string, unknown> | null {
  const definition = getActivityAction(actionId)
  if (!definition) return null
  const parsed = definition.metadata.safeParse(raw ?? {})
  return parsed.success ? parsed.data : null
}

export function parseActivityChangeValue(
  actionId: string,
  raw: unknown
): Record<string, unknown> | null {
  const definition = getActivityAction(actionId)
  if (!definition || !("changes" in definition) || !definition.changes)
    return null
  const parsed = definition.changes.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export function serializeUnifiedActivityItem(input: {
  event: ActivityRow
  actor: { name: string | null; image: string | null }
  visibility: ActivityClientVisibility
  canViewTarget: boolean
  targetUrl: string | null
  metadata: Record<string, unknown> | null
  beforeValue: Record<string, unknown> | null
  afterValue: Record<string, unknown> | null
}) {
  const {
    event,
    actor,
    visibility,
    canViewTarget,
    targetUrl,
    metadata,
    beforeValue,
    afterValue,
  } = input
  const exposePayload = visibility === "detail"
  return {
    activityId: event.activityId,
    actionId: event.actionId,
    category: event.category,
    schemaVersion: event.schemaVersion,
    actorType: event.actorType,
    actorUserId: event.actorUserId,
    actorName: actor.name,
    actorImage: actor.image,
    outcome: event.outcome,
    occurredAt: event.occurredAt,
    recordedAt: event.recordedAt,
    sourceApp: event.sourceApp,
    sourceModule: event.sourceModule,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    beforeValue: exposePayload ? beforeValue : null,
    afterValue: exposePayload ? afterValue : null,
    metadata: exposePayload ? metadata : null,
    canViewTarget,
    targetUrl,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
  }
}
