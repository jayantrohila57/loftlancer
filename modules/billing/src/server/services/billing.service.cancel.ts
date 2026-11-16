import {
  resolveAutumnPlanIdPaid,
  syncEntitlementsFromAutumnCustomer,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { CustomerExpand } from "autumn-js"
import { eq } from "drizzle-orm"

import { requireBillingAutumnContext } from "../shared/billing.autumn-context"

export async function billingBeginCancelService(input: {
  organizationId: string
}) {
  const { client, customerId } = await requireBillingAutumnContext(input)
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  await client.billing.update({
    customerId,
    planId: resolveAutumnPlanIdPaid(),
    cancelAction: "cancel_end_of_cycle",
  })

  const customer = await client.customers.get({
    customerId,
    expand: [CustomerExpand.SubscriptionsPlan, CustomerExpand.BalancesFeature],
  })
  await syncEntitlementsFromAutumnCustomer({
    db,
    organizationId: input.organizationId,
    customer,
  })
  await db
    .update(orgEntitlement)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(orgEntitlement.organizationId, input.organizationId))

  return createSuccess(
    { cancelAtPeriodEnd: true as const },
    "Your Paid plan will cancel at the end of the billing period."
  )
}
