import type { Db } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import type { Customer } from "autumn-js"
import { eq } from "drizzle-orm"
import {
  AUTUMN_FEATURE_AI_USAGE_CREDITS,
  BILLING_FREE_PLAN_QUOTA_BYTES,
  BILLING_PAID_PLAN_QUOTA_BYTES,
} from "./billing.constants"
import { planIdToProductTier } from "./billing.plan-ids"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"])

export type EntitlementCachePatch = {
  planTier: "free" | "paid"
  subscriptionStatus:
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete"
  quotaBytes: number
  aiEnabled: boolean
  aiCreditBalance?: number
  autumnCustomerId: string
}

export function deriveEntitlementPatchFromCustomer(
  customer: Customer
): EntitlementCachePatch {
  const autumnCustomerId = customer.id ?? ""
  const baseSubscription =
    customer.subscriptions?.find(
      (sub) => !sub.addOn && ACTIVE_SUBSCRIPTION_STATUSES.has(sub.status)
    ) ?? customer.subscriptions?.find((sub) => !sub.addOn)

  const planId = baseSubscription?.planId ?? ""
  const planTier = planId ? planIdToProductTier(planId) : "free"
  const subscriptionStatus = mapSubscriptionStatus(
    baseSubscription?.status,
    baseSubscription?.pastDue
  )

  const quotaBytes =
    planTier === "paid"
      ? BILLING_PAID_PLAN_QUOTA_BYTES
      : BILLING_FREE_PLAN_QUOTA_BYTES
  const aiEnabled = planTier === "paid"

  const aiBalance = customer.balances?.[AUTUMN_FEATURE_AI_USAGE_CREDITS]
  const aiCreditBalance =
    typeof aiBalance?.remaining === "number"
      ? Math.max(0, Math.floor(aiBalance.remaining))
      : undefined

  return {
    planTier,
    subscriptionStatus,
    quotaBytes,
    aiEnabled,
    aiCreditBalance,
    autumnCustomerId,
  }
}

function mapSubscriptionStatus(
  status: string | undefined,
  pastDue: boolean | undefined
): "active" | "past_due" | "canceled" | "trialing" | "incomplete" {
  if (pastDue) return "past_due"
  if (status === "trialing") return "trialing"
  if (status === "canceled") return "canceled"
  if (status === "incomplete") return "incomplete"
  if (status === "past_due") return "past_due"
  return "active"
}

export type EntitlementSyncResult = {
  planTierBefore: "free" | "paid"
  planTierAfter: "free" | "paid"
  planTierChanged: boolean
}

export async function applyEntitlementPatchForOrganization(input: {
  db: Db
  organizationId: string
  patch: EntitlementCachePatch
  subscriptionRevisionDelta?: number
}): Promise<EntitlementSyncResult> {
  const [existing] = await input.db
    .select({ planTier: orgEntitlement.planTier })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  const planTierBefore = existing?.planTier ?? "free"

  const now = new Date()
  const set: Record<string, unknown> = {
    planTier: input.patch.planTier,
    subscriptionStatus: input.patch.subscriptionStatus,
    quotaBytes: input.patch.quotaBytes,
    aiEnabled: input.patch.aiEnabled,
    autumnCustomerId: input.patch.autumnCustomerId,
    entitlementsSyncedAt: now,
    entitlementsDegraded: false,
    orgProvisioningStep: "complete",
    updatedAt: now,
  }
  if (input.patch.aiCreditBalance !== undefined) {
    set.aiCreditBalance = input.patch.aiCreditBalance
  }

  if (input.subscriptionRevisionDelta !== undefined) {
    const [current] = await input.db
      .select({ revision: orgEntitlement.subscriptionRevision })
      .from(orgEntitlement)
      .where(eq(orgEntitlement.organizationId, input.organizationId))
      .limit(1)
    await input.db
      .update(orgEntitlement)
      .set({
        ...set,
        subscriptionRevision:
          (current?.revision ?? 0) + input.subscriptionRevisionDelta,
      })
      .where(eq(orgEntitlement.organizationId, input.organizationId))
    return {
      planTierBefore,
      planTierAfter: input.patch.planTier,
      planTierChanged: planTierBefore !== input.patch.planTier,
    }
  }

  await input.db
    .update(orgEntitlement)
    .set(set)
    .where(eq(orgEntitlement.organizationId, input.organizationId))

  return {
    planTierBefore,
    planTierAfter: input.patch.planTier,
    planTierChanged: planTierBefore !== input.patch.planTier,
  }
}

export async function syncEntitlementsFromAutumnCustomer(input: {
  db: Db
  organizationId: string
  customer: Customer
}): Promise<EntitlementSyncResult> {
  const patch = deriveEntitlementPatchFromCustomer(input.customer)
  return applyEntitlementPatchForOrganization({
    db: input.db,
    organizationId: input.organizationId,
    patch,
    subscriptionRevisionDelta: 1,
  })
}
