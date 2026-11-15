import { isDeepStrictEqual } from "node:util"
import type { Db } from "@packages/drizzle"
import { getDb } from "@packages/drizzle"
import { activityEvent } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq } from "drizzle-orm"
import type { ActivityActionId } from "../../utils/config/activity.actions"
import { activityActions } from "../../utils/config/activity.actions"
import { activityOutcomeSchema } from "../../utils/validation/activity.events.schema"

type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0]
type Executor = Db | Transaction
export interface ActivityContext {
  activityId: string
  actionId: ActivityActionId
  ownerUserId: string
  actor: { type: "user"; userId: string } | { type: "system" | "integration" }
  occurredAt: Date
}

/** Call before the operation; pass this context through retries and logs. */
export function beginActivity(input: {
  actionId: ActivityActionId
  ownerUserId: string
  actor: ActivityContext["actor"]
  activityId?: string
}): ActivityContext {
  if (
    !activityActions[input.actionId] ||
    !input.ownerUserId ||
    (input.actor.type === "user" && !input.actor.userId)
  )
    throw new Error("Invalid activity context")
  const context = {
    ...input,
    activityId: input.activityId ?? crypto.randomUUID(),
    occurredAt: new Date(),
  }
  logger.info("activity.started", {
    actionId: context.actionId,
    activityId: context.activityId,
  })
  return context
}

async function recordActivityInternal(
  context: ActivityContext,
  input: {
    outcome: "success" | "denied" | "failed" | "error"
    sourceApp?: string
    sourceModule: string
    resourceType?: string
    resourceId?: string
    metadata?: unknown
    beforeValue?: unknown
    afterValue?: unknown
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    correlationId?: string
  },
  executor?: Executor
) {
  const definition = activityActions[context.actionId]
  if (
    !definition ||
    !context.ownerUserId ||
    !context.activityId ||
    !Number.isFinite(context.occurredAt.getTime())
  )
    throw new Error("Invalid activity context")
  activityOutcomeSchema.exclude(["unknown"]).parse(input.outcome)
  const metadata = definition.metadata.parse(input.metadata ?? {})
  const changeSchema = "changes" in definition ? definition.changes : undefined
  if (
    !changeSchema &&
    (input.beforeValue !== undefined || input.afterValue !== undefined)
  )
    throw new Error("Action does not permit change values")
  if ((input.beforeValue === undefined) !== (input.afterValue === undefined))
    throw new Error("Both change values are required")
  const beforeValue =
    changeSchema && input.beforeValue !== undefined
      ? changeSchema.parse(input.beforeValue)
      : null
  const afterValue =
    changeSchema && input.afterValue !== undefined
      ? changeSchema.parse(input.afterValue)
      : null
  const row = {
    activityId: context.activityId,
    actionId: context.actionId,
    category: definition.category,
    ownerUserId: context.ownerUserId,
    actorType: context.actor.type,
    actorUserId: context.actor.type === "user" ? context.actor.userId : null,
    occurredAt: context.occurredAt,
    outcome: input.outcome,
    sourceApp: input.sourceApp ?? null,
    sourceModule: input.sourceModule,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId ?? null,
    metadata,
    beforeValue,
    afterValue,
    target: { routeKey: definition.target },
    sessionId: input.sessionId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    correlationId: input.correlationId ?? null,
  }
  const db = executor ?? getDb()
  if (!db) throw new Error("Database unavailable")
  const inserted = await db
    .insert(activityEvent)
    .values(row)
    .onConflictDoNothing()
    .returning({ activityId: activityEvent.activityId })
  if (inserted.length) return { activityId: context.activityId, created: true }
  const [existing] = await db
    .select()
    .from(activityEvent)
    .where(
      and(
        eq(activityEvent.activityId, context.activityId),
        eq(activityEvent.ownerUserId, context.ownerUserId)
      )
    )
    .limit(1)
  if (
    !existing ||
    !Object.entries(row).every(([key, value]) =>
      isDeepStrictEqual(existing[key as keyof typeof existing], value)
    )
  )
    throw new Error("Activity ID already used for a different event")
  return { activityId: context.activityId, created: false }
}

/** Server only. A transaction may be passed to commit an event with its mutation. */
export async function recordActivity(
  ...args: Parameters<typeof recordActivityInternal>
) {
  const [context, input] = args
  try {
    const result = await recordActivityInternal(...args)
    logger.info("activity.write.completed", {
      app: input.sourceApp,
      module: input.sourceModule,
      actionId: context.actionId,
      activityId: context.activityId,
      correlationId: input.correlationId,
    })
    return result
  } catch (error) {
    logger.error("activity.record.failed", {
      app: input.sourceApp,
      module: input.sourceModule,
      actionId: context.actionId,
      activityId: context.activityId,
      correlationId: input.correlationId,
      outcome: "error",
    })
    throw error
  }
}
