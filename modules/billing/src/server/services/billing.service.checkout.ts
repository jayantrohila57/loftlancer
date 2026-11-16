import {
  bindOrganizationAutumnCustomer,
  deriveEntitlementPatchFromCustomer,
  getAutumnClient,
  isAutumnConfigured,
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
  syncEntitlementsFromAutumnCustomer,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { CustomerExpand } from "autumn-js"
import { eq } from "drizzle-orm"

import { recordBillingPlanChangedIfNeeded } from "./billing.service.activity"

export type BillingCheckoutResult =
  | {
      readonly ok: true
      readonly alreadySubscribed: boolean
      readonly paymentUrl: string | null
      readonly planId: string
      readonly planTier: "free" | "paid"
      readonly organizationId: string
    }
  | {
      readonly ok: false
      readonly code:
        | "autumn_unconfigured"
        | "database_unavailable"
        | "invalid_plan"
        | "free_plan_no_checkout"
        | "autumn_unavailable"
    }

export type BillingSubscriptionStatusResult =
  | {
      readonly ok: true
      readonly hasProduct: boolean
      readonly planId: string
      readonly planTier: "free" | "paid"
      readonly organizationId: string
      readonly subscriptionStatus: string
    }
  | {
      readonly ok: false
      readonly code:
        | "autumn_unconfigured"
        | "database_unavailable"
        | "autumn_unavailable"
    }

export async function billingStartCheckoutService(input: {
  readonly organizationId: string
  readonly actorUserId?: string
  readonly planId: string
  readonly successUrl: string
  readonly cancelUrl: string
}): Promise<BillingCheckoutResult> {
  if (!isAutumnConfigured()) {
    return { ok: false, code: "autumn_unconfigured" }
  }

  const freePlanId = resolveAutumnPlanIdFree()
  const paidPlanId = resolveAutumnPlanIdPaid()
  if (input.planId === freePlanId) {
    return { ok: false, code: "free_plan_no_checkout" }
  }
  if (input.planId !== paidPlanId) {
    return { ok: false, code: "invalid_plan" }
  }

  const db = getDb()
  if (!db) {
    return { ok: false, code: "database_unavailable" }
  }

  const bound = await bindOrganizationAutumnCustomer({
    organizationId: input.organizationId,
  })
  if (!bound.bound) {
    return { ok: false, code: "autumn_unavailable" }
  }

  const [row] = await db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)

  const customerId =
    row?.autumnCustomerId ?? bound.customerId ?? input.organizationId
  const client = getAutumnClient()
  if (!client) {
    return { ok: false, code: "autumn_unavailable" }
  }

  const attach = await client.billing.attach({
    customerId,
    planId: paidPlanId,
    successUrl: input.successUrl,
    checkoutSessionParams: {
      cancel_url: input.cancelUrl,
    },
  })

  if (!attach.paymentUrl) {
    const customer = await client.customers.get({
      customerId,
      expand: [
        CustomerExpand.SubscriptionsPlan,
        CustomerExpand.BalancesFeature,
      ],
    })
    const sync = await syncEntitlementsFromAutumnCustomer({
      db,
      organizationId: input.organizationId,
      customer,
    })
    await recordBillingPlanChangedIfNeeded({
      organizationId: input.organizationId,
      sync,
      source: "upgrade",
      actorUserId: input.actorUserId,
    })
    return {
      ok: true,
      alreadySubscribed: true,
      paymentUrl: null,
      planId: paidPlanId,
      planTier: "paid",
      organizationId: input.organizationId,
    }
  }

  return {
    ok: true,
    alreadySubscribed: false,
    paymentUrl: attach.paymentUrl,
    planId: paidPlanId,
    planTier: "free",
    organizationId: input.organizationId,
  }
}

export async function billingReadSubscriptionStatusService(input: {
  readonly organizationId: string
}): Promise<BillingSubscriptionStatusResult> {
  if (!isAutumnConfigured()) {
    return { ok: false, code: "autumn_unconfigured" }
  }

  const db = getDb()
  if (!db) {
    return { ok: false, code: "database_unavailable" }
  }

  const client = getAutumnClient()
  if (!client) {
    return { ok: false, code: "autumn_unavailable" }
  }

  const [row] = await db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)

  const customerId = row?.autumnCustomerId ?? input.organizationId
  const customer = await client.customers.get({
    customerId,
    expand: [CustomerExpand.SubscriptionsPlan, CustomerExpand.BalancesFeature],
  })
  const patch = deriveEntitlementPatchFromCustomer(customer)
  const paidPlanId = resolveAutumnPlanIdPaid()
  const freePlanId = resolveAutumnPlanIdFree()

  return {
    ok: true,
    hasProduct: patch.planTier === "paid",
    planId: patch.planTier === "paid" ? paidPlanId : freePlanId,
    planTier: patch.planTier,
    organizationId: input.organizationId,
    subscriptionStatus: patch.subscriptionStatus,
  }
}
