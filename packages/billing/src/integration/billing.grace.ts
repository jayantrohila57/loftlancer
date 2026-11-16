import type { Db } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { serverEnv } from "@packages/t3-env/server"
import { CustomerExpand } from "autumn-js"
import { and, eq, isNotNull, lte } from "drizzle-orm"
import { invalidateBillingAccessCache } from "./billing.access"
import { getAutumnClient } from "./billing.autumn-client"
import { syncEntitlementsFromAutumnCustomer } from "./billing.entitlement-sync"
import {
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
} from "./billing.plan-ids"
import {
  computePaymentGraceUntil,
  isPaymentGraceExpired,
  paymentGraceDaysFromEnv,
} from "./billing.webhook-events"

export async function startPaymentGrace(input: {
  db: Db
  organizationId: string
  now?: Date
}) {
  const now = input.now ?? new Date()
  const [row] = await input.db
    .select({
      paymentGraceUntil: orgEntitlement.paymentGraceUntil,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  if (!row) return
  if (
    row.paymentGraceUntil &&
    !isPaymentGraceExpired({
      paymentGraceUntil: row.paymentGraceUntil,
      now,
    })
  ) {
    return
  }
  const until = computePaymentGraceUntil({
    now,
    days: paymentGraceDaysFromEnv(serverEnv.BILLING_PAYMENT_GRACE_DAYS),
  })
  await input.db
    .update(orgEntitlement)
    .set({
      paymentGraceUntil: until,
      subscriptionStatus: "past_due",
      updatedAt: now,
    })
    .where(eq(orgEntitlement.organizationId, input.organizationId))
  invalidateBillingAccessCache(input.organizationId)
}

export async function clearPaymentGrace(input: {
  db: Db
  organizationId: string
}) {
  const now = new Date()
  await input.db
    .update(orgEntitlement)
    .set({
      paymentGraceUntil: null,
      subscriptionStatus: "active",
      updatedAt: now,
    })
    .where(eq(orgEntitlement.organizationId, input.organizationId))
  invalidateBillingAccessCache(input.organizationId)
}

export async function downgradeOrganizationToFree(input: {
  db: Db
  organizationId: string
  autumnCustomerId?: string | null
}) {
  const client = getAutumnClient()
  const customerId = input.autumnCustomerId ?? input.organizationId
  if (client) {
    try {
      await client.billing.attach({
        customerId,
        planId: resolveAutumnPlanIdFree(),
        removePlanIds: [resolveAutumnPlanIdPaid()],
      })
      const customer = await client.customers.get({
        customerId,
        expand: [
          CustomerExpand.SubscriptionsPlan,
          CustomerExpand.BalancesFeature,
        ],
      })
      await syncEntitlementsFromAutumnCustomer({
        db: input.db,
        organizationId: input.organizationId,
        customer,
      })
    } catch (error) {
      logger.error("billing.grace.downgrade_failed", {
        app: "auth",
        module: "billing",
        outcome: "error",
        errorCode: "GRACE_DOWNGRADE_FAILED",
        output: {
          organizationId: input.organizationId,
          message: error instanceof Error ? error.message : "unknown",
        },
      })
    }
  }
  const now = new Date()
  await input.db
    .update(orgEntitlement)
    .set({
      planTier: "free",
      subscriptionStatus: "canceled",
      paymentGraceUntil: null,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    })
    .where(eq(orgEntitlement.organizationId, input.organizationId))
  invalidateBillingAccessCache(input.organizationId)
}

export async function maybeDowngradeExpiredGrace(input: {
  db: Db
  organizationId: string
}) {
  const [row] = await input.db
    .select({
      paymentGraceUntil: orgEntitlement.paymentGraceUntil,
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      planTier: orgEntitlement.planTier,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  if (!row?.paymentGraceUntil) return false
  if (
    !isPaymentGraceExpired({
      paymentGraceUntil: row.paymentGraceUntil,
    })
  ) {
    return false
  }
  await downgradeOrganizationToFree({
    db: input.db,
    organizationId: input.organizationId,
    autumnCustomerId: row.autumnCustomerId,
  })
  return true
}

export async function downgradeExpiredGraceSubscriptions(input: {
  db: Db
  limit?: number
}) {
  const now = new Date()
  const rows = await input.db
    .select({
      organizationId: orgEntitlement.organizationId,
      autumnCustomerId: orgEntitlement.autumnCustomerId,
    })
    .from(orgEntitlement)
    .where(
      and(
        isNotNull(orgEntitlement.paymentGraceUntil),
        lte(orgEntitlement.paymentGraceUntil, now)
      )
    )
    .limit(input.limit ?? 50)

  let downgraded = 0
  for (const row of rows) {
    await downgradeOrganizationToFree({
      db: input.db,
      organizationId: row.organizationId,
      autumnCustomerId: row.autumnCustomerId,
    })
    downgraded += 1
  }
  return { scanned: rows.length, downgraded }
}
