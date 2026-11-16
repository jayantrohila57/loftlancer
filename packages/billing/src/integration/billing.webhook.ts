import { createHash } from "node:crypto"
import { getDb } from "@packages/drizzle"
import { billingWebhookEvent, orgEntitlement } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { serverEnv } from "@packages/t3-env/server"
import { CustomerExpand } from "autumn-js"
import { and, eq, lt, or } from "drizzle-orm"

import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"
import { syncEntitlementsFromAutumnCustomer } from "./billing.entitlement-sync"
import {
  clearPaymentGrace,
  maybeDowngradeExpiredGrace,
  startPaymentGrace,
} from "./billing.grace"
import { classifyBillingWebhookEvent } from "./billing.webhook-events"
import { verifyAutumnWebhookSignatureWithSecret } from "./billing.webhook-signature"

export function verifyAutumnWebhookSignature(input: {
  rawBody: string
  headers: {
    id: string | null
    timestamp: string | null
    signature: string | null
  }
}) {
  const secret = serverEnv.AUTUMN_WEBHOOK_SECRET
  if (!secret) return false
  return verifyAutumnWebhookSignatureWithSecret({ secret, ...input })
}

function payloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex")
}

function extractWebhookMeta(
  payload: unknown,
  deliveryId: string
): {
  eventId: string
  eventType: string
  customerId: string | null
} {
  if (!payload || typeof payload !== "object") {
    return {
      eventId: deliveryId,
      eventType: "unknown",
      customerId: null,
    }
  }
  const record = payload as Record<string, unknown>
  const eventId =
    (typeof record.id === "string" && record.id) ||
    (typeof record.event_id === "string" && record.event_id) ||
    deliveryId
  const eventType =
    (typeof record.type === "string" && record.type) ||
    (typeof record.event_type === "string" && record.event_type) ||
    "unknown"
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record
  const customerId =
    (typeof data.customer_id === "string" && data.customer_id) ||
    (typeof data.customerId === "string" && data.customerId) ||
    (typeof record.customer_id === "string" && record.customer_id) ||
    (typeof record.customerId === "string" && record.customerId) ||
    null
  return { eventId, eventType, customerId }
}

async function resolveOrganizationIdForCustomer(customerId: string) {
  const db = getDb()
  if (!db) return null
  const [byAutumn] = await db
    .select({ organizationId: orgEntitlement.organizationId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.autumnCustomerId, customerId))
    .limit(1)
  if (byAutumn) return byAutumn.organizationId
  const [byOrgId] = await db
    .select({ organizationId: orgEntitlement.organizationId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, customerId))
    .limit(1)
  return byOrgId?.organizationId ?? null
}

export async function handleAutumnBillingWebhook(input: {
  rawBody: string
  headers: {
    id: string | null
    timestamp: string | null
    signature: string | null
  }
}) {
  if (!verifyAutumnWebhookSignature(input)) {
    return { status: 401 as const, body: { error: "invalid_signature" } }
  }

  let payload: unknown
  try {
    payload = JSON.parse(input.rawBody) as unknown
  } catch {
    return { status: 400 as const, body: { error: "invalid_json" } }
  }

  const { eventId, eventType, customerId } = extractWebhookMeta(
    payload,
    input.headers.id ?? ""
  )
  const hash = payloadHash(input.rawBody)

  const db = getDb()
  if (!db) {
    return { status: 503 as const, body: { error: "database_unavailable" } }
  }

  const organizationId = customerId
    ? await resolveOrganizationIdForCustomer(customerId)
    : null

  const [inserted] = await db
    .insert(billingWebhookEvent)
    .values({
      eventId,
      eventType,
      customerId,
      organizationId,
      payloadHash: hash,
      status: "received",
    })
    .onConflictDoNothing()
    .returning({ eventId: billingWebhookEvent.eventId })

  if (!inserted) {
    const [existing] = await db
      .select({
        status: billingWebhookEvent.status,
        payloadHash: billingWebhookEvent.payloadHash,
      })
      .from(billingWebhookEvent)
      .where(eq(billingWebhookEvent.eventId, eventId))
      .limit(1)
    if (!existing)
      return { status: 503 as const, body: { error: "event_unavailable" } }
    if (existing.payloadHash !== hash) {
      return { status: 409 as const, body: { error: "event_payload_mismatch" } }
    }
    if (existing.status === "processed" || existing.status === "ignored") {
      return { status: 200 as const, body: { duplicate: true } }
    }
    const [claimed] = await db
      .update(billingWebhookEvent)
      .set({ status: "received", receivedAt: new Date(), processedAt: null })
      .where(
        and(
          eq(billingWebhookEvent.eventId, eventId),
          or(
            eq(billingWebhookEvent.status, "failed"),
            and(
              eq(billingWebhookEvent.status, "received"),
              lt(billingWebhookEvent.receivedAt, new Date(Date.now() - 300_000))
            )
          )
        )
      )
      .returning({ eventId: billingWebhookEvent.eventId })
    if (!claimed)
      return { status: 503 as const, body: { error: "event_in_progress" } }
  }

  if (!customerId) {
    await db
      .update(billingWebhookEvent)
      .set({ status: "ignored", processedAt: new Date() })
      .where(eq(billingWebhookEvent.eventId, eventId))
    return { status: 200 as const, body: { ignored: true } }
  }

  if (!organizationId || !isAutumnConfigured()) {
    await db
      .update(billingWebhookEvent)
      .set({ status: "failed", processedAt: new Date() })
      .where(eq(billingWebhookEvent.eventId, eventId))
    return { status: 503 as const, body: { error: "billing_not_ready" } }
  }

  const client = getAutumnClient()
  if (!client) {
    await db
      .update(billingWebhookEvent)
      .set({ status: "failed", processedAt: new Date() })
      .where(eq(billingWebhookEvent.eventId, eventId))
    return { status: 503 as const, body: { error: "autumn_unavailable" } }
  }

  try {
    const customer = await client.customers.get({
      customerId,
      expand: [
        CustomerExpand.SubscriptionsPlan,
        CustomerExpand.BalancesFeature,
      ],
    })
    const kind = classifyBillingWebhookEvent({
      eventType,
      payload,
    })
    const sync = await syncEntitlementsFromAutumnCustomer({
      db,
      organizationId,
      customer,
    })
    if (kind === "payment_failed") {
      await startPaymentGrace({ db, organizationId })
    }
    if (kind === "invoice_paid") {
      await clearPaymentGrace({ db, organizationId })
    }
    const graceDowngraded = await maybeDowngradeExpiredGrace({
      db,
      organizationId,
    })
    await db
      .update(billingWebhookEvent)
      .set({ status: "processed", processedAt: new Date() })
      .where(eq(billingWebhookEvent.eventId, eventId))
    logger.info("billing.webhook.processed", {
      app: "auth",
      module: "billing",
      outcome: "success",
      output: { eventId, eventType, kind, organizationId, graceDowngraded },
    })
    return {
      status: 200 as const,
      body: {
        processed: true,
        organizationId,
        kind,
        graceDowngraded,
        planTierChanged: sync.planTierChanged,
        planTierBefore: sync.planTierBefore,
        planTierAfter: sync.planTierAfter,
      },
    }
  } catch (error) {
    await db
      .update(billingWebhookEvent)
      .set({ status: "failed", processedAt: new Date() })
      .where(eq(billingWebhookEvent.eventId, eventId))
    logger.error("billing.webhook.failed", {
      app: "auth",
      module: "billing",
      outcome: "error",
      errorCode: "webhook_sync_failed",
      output: {
        eventId,
        message: error instanceof Error ? error.message : "unknown",
      },
    })
    return { status: 500 as const, body: { error: "sync_failed" } }
  }
}
