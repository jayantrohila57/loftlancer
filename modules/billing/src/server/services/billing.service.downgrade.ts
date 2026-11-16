import {
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
  syncEntitlementsFromAutumnCustomer,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { CustomerExpand } from "autumn-js"
import { requireBillingAutumnContext } from "../shared/billing.autumn-context"
import { recordBillingPlanChangedIfNeeded } from "./billing.service.activity"

export async function billingBeginDowngradeService(input: {
  organizationId: string
  actorUserId?: string
  successUrl?: string
  cancelUrl?: string
}) {
  const { client, customerId } = await requireBillingAutumnContext(input)

  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const attach = await client.billing.attach({
    customerId,
    planId: resolveAutumnPlanIdFree(),
    removePlanIds: [resolveAutumnPlanIdPaid()],
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
      source: "downgrade",
      actorUserId: input.actorUserId,
    })
  }

  return createSuccess(
    {
      paymentUrl: attach.paymentUrl ?? null,
      planTier: attach.paymentUrl ? ("paid" as const) : ("free" as const),
    },
    attach.paymentUrl
      ? "Complete checkout to finish your plan change."
      : "Your organization is on the Free plan."
  )
}
