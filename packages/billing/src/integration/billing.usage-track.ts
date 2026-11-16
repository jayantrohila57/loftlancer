import { randomUUID } from "node:crypto"
import { getDb } from "@packages/drizzle"
import { autumnTrackOutbox, orgEntitlement } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq } from "drizzle-orm"

import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"

const MAX_ATTEMPTS = 5

export async function trackBillingUsage(input: {
  organizationId: string
  featureId: string
  value: number
  idempotencyKey: string
}): Promise<void> {
  const db = getDb()
  if (!db || input.value === 0) return

  const [existing] = await db
    .select({
      id: autumnTrackOutbox.id,
      status: autumnTrackOutbox.status,
    })
    .from(autumnTrackOutbox)
    .where(
      and(
        eq(autumnTrackOutbox.organizationId, input.organizationId),
        eq(autumnTrackOutbox.idempotencyKey, input.idempotencyKey)
      )
    )
    .limit(1)

  if (existing?.status === "sent") return

  const rowId = existing?.id ?? randomUUID()
  if (!existing) {
    await db.insert(autumnTrackOutbox).values({
      id: rowId,
      organizationId: input.organizationId,
      featureId: input.featureId,
      value: input.value,
      idempotencyKey: input.idempotencyKey,
      status: "pending",
    })
  }

  if (!isAutumnConfigured()) return
  const client = getAutumnClient()
  if (!client) return

  const [entitlement] = await db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  const customerId = entitlement?.autumnCustomerId ?? input.organizationId

  try {
    await client.track({
      customerId,
      featureId: input.featureId,
      value: input.value,
      properties: { idempotencyKey: input.idempotencyKey },
      async: false,
    })
    const [current] = await db
      .select({ attempts: autumnTrackOutbox.attempts })
      .from(autumnTrackOutbox)
      .where(eq(autumnTrackOutbox.id, rowId))
      .limit(1)
    await db
      .update(autumnTrackOutbox)
      .set({
        status: "sent",
        lastError: null,
        updatedAt: new Date(),
        attempts: (current?.attempts ?? 0) + 1,
      })
      .where(eq(autumnTrackOutbox.id, rowId))
  } catch (error) {
    const message = error instanceof Error ? error.message : "track_failed"
    const [current] = await db
      .select({ attempts: autumnTrackOutbox.attempts })
      .from(autumnTrackOutbox)
      .where(eq(autumnTrackOutbox.id, rowId))
      .limit(1)
    const attempts = (current?.attempts ?? 0) + 1
    await db
      .update(autumnTrackOutbox)
      .set({
        status: attempts >= MAX_ATTEMPTS ? "dead_letter" : "pending",
        attempts,
        lastError: message.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(autumnTrackOutbox.id, rowId))
    logger.error("billing.usage.track_failed", {
      app: "auth",
      module: "billing",
      outcome: "error",
      errorCode: "USAGE_TRACK_FAILED",
      output: {
        organizationId: input.organizationId,
        featureId: input.featureId,
      },
    })
  }
}
