import { getAutumnClient, isAutumnConfigured } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { eq } from "drizzle-orm"

export async function billingOpenPortalService(input: {
  organizationId: string
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

  const [row] = await db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)

  if (!row?.autumnCustomerId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Billing customer is not linked yet.",
      data: { code: "billing.customer_unbound" },
    })
  }

  const client = getAutumnClient()
  if (!client) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Billing is not configured.",
      data: { code: "billing.autumn_unconfigured" },
    })
  }

  const session = await client.billing.openCustomerPortal({
    customerId: row.autumnCustomerId,
  })

  const portalUrl = session.url
  if (!portalUrl) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Could not create a billing portal session.",
      data: { code: "billing.portal_failed" },
    })
  }

  return createSuccess({ portalUrl }, "Billing portal session created.")
}
