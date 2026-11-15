import { getAutumnClient, isAutumnConfigured } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { ORPCError } from "@packages/orpc/server"
import type { Autumn } from "autumn-js"

import { readOrgAutumnCustomerId } from "../repositories/billing.repository.customer"

export async function requireBillingAutumnContext(input: {
  organizationId: string
}): Promise<{
  client: Autumn
  customerId: string
}> {
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

  const client = getAutumnClient()
  if (!client) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Billing is not configured.",
      data: { code: "billing.autumn_unconfigured" },
    })
  }

  const boundCustomerId = await readOrgAutumnCustomerId({
    db,
    organizationId: input.organizationId,
  })
  const customerId = boundCustomerId ?? input.organizationId

  if (!boundCustomerId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Billing customer is not linked yet.",
      data: { code: "billing.customer_unbound" },
    })
  }

  return { client, customerId }
}
