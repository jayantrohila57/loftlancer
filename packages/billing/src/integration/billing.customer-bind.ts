import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { CustomerExpand } from "autumn-js"
import { eq } from "drizzle-orm"

import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"
import { syncEntitlementsFromAutumnCustomer } from "./billing.entitlement-sync"
import { resolveAutumnPlanIdFree } from "./billing.plan-ids"

export async function bindOrganizationAutumnCustomer(input: {
  organizationId: string
  organizationName?: string | null
  ownerEmail?: string | null
}) {
  if (!isAutumnConfigured()) {
    logger.warn("billing.autumn_bind.skipped", {
      app: "auth",
      module: "billing",
      output: {
        organizationId: input.organizationId,
        reason: "AUTUMN_SECRET_KEY unset",
      },
    })
    return { bound: false as const, reason: "autumn_not_configured" as const }
  }

  const db = getDb()
  if (!db) {
    throw new Error("Database is not configured")
  }

  const client = getAutumnClient()
  if (!client) {
    return { bound: false as const, reason: "autumn_not_configured" as const }
  }

  const [row] = await db
    .select({
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      orgProvisioningStep: orgEntitlement.orgProvisioningStep,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)

  if (row?.autumnCustomerId && row.orgProvisioningStep === "complete") {
    return { bound: true as const, customerId: row.autumnCustomerId }
  }

  try {
    const customer = await client.customers.getOrCreate({
      customerId: input.organizationId,
      name: input.organizationName ?? undefined,
      email: input.ownerEmail ?? undefined,
      autoEnablePlanId: resolveAutumnPlanIdFree(),
      expand: [
        CustomerExpand.SubscriptionsPlan,
        CustomerExpand.BalancesFeature,
      ],
    })

    const autumnCustomerId = customer.id ?? input.organizationId
    await syncEntitlementsFromAutumnCustomer({
      db,
      organizationId: input.organizationId,
      customer,
    })

    logger.info("billing.autumn_bind.completed", {
      app: "auth",
      module: "billing",
      outcome: "success",
      output: {
        organizationId: input.organizationId,
        autumnCustomerId,
      },
    })

    return { bound: true as const, customerId: autumnCustomerId }
  } catch (error) {
    logger.error("billing.autumn_bind.failed", {
      app: "auth",
      module: "billing",
      outcome: "error",
      errorCode: "autumn_bind_failed",
      output: {
        organizationId: input.organizationId,
        message: error instanceof Error ? error.message : "unknown",
      },
    })
    return { bound: false as const, reason: "autumn_api_error" as const }
  }
}
