import {
  bindOrganizationAutumnCustomer,
  getAutumnClient,
  isAutumnConfigured,
  resolveAutumnPlanIdPaid,
  syncEntitlementsFromAutumnCustomer,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { CustomerExpand } from "autumn-js"
import { eq } from "drizzle-orm"
import { recordBillingPlanChangedIfNeeded } from "./billing.service.activity"

export async function billingBeginUpgradeService(input: {
  organizationId: string
  actorUserId?: string
  successUrl?: string
  cancelUrl?: string
}) {
  if (!isAutumnConfigured()) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Billing is not configured.",
      data: { code: "billing.autumn_unconfigured" },
    })
  }

  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const bound = await bindOrganizationAutumnCustomer({
    organizationId: input.organizationId,
  })
  if (!bound.bound) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Billing customer is not ready for checkout.",
      data: { code: "billing.customer_unbound" },
    })
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
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Billing is not configured.",
      data: { code: "billing.autumn_unconfigured" },
    })
  }

  const attach = await client.billing.attach({
    customerId,
    planId: resolveAutumnPlanIdPaid(),
    ...(input.successUrl ? { successUrl: input.successUrl } : {}),
    ...(input.cancelUrl
      ? { checkoutSessionParams: { cancel_url: input.cancelUrl } }
      : {}),
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
  }

  return createSuccess(
    {
      paymentUrl: attach.paymentUrl,
      planTier: attach.paymentUrl ? ("free" as const) : ("paid" as const),
    },
    attach.paymentUrl
      ? "Continue to checkout to complete your upgrade."
      : "Your organization is on the Paid plan."
  )
}
