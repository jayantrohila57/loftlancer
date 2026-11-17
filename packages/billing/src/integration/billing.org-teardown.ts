import { getDb } from "@packages/drizzle"
import { organization, orgEntitlement } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { eq } from "drizzle-orm"

import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"
import {
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
} from "./billing.plan-ids"

/** Cancel org billing and remove the organization row (cascades app data). */
export async function teardownOrganizationForAccountDeletion(input: {
  readonly organizationId: string
}) {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")

  const [entitlement] = await db
    .select({
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      planTier: orgEntitlement.planTier,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)

  if (isAutumnConfigured()) {
    const client = getAutumnClient()
    const customerId = entitlement?.autumnCustomerId ?? input.organizationId
    if (client) {
      try {
        if (entitlement?.planTier === "paid") {
          await client.billing.update({
            customerId,
            planId: resolveAutumnPlanIdPaid(),
            cancelAction: "cancel_immediately",
          })
        }
        await client.billing.attach({
          customerId,
          planId: resolveAutumnPlanIdFree(),
          removePlanIds: [resolveAutumnPlanIdPaid()],
        })
      } catch (error) {
        logger.error("billing.org_teardown.autumn_failed", {
          app: "auth",
          module: "billing",
          outcome: "error",
          errorCode: "ORG_TEARDOWN_AUTUMN_FAILED",
          output: {
            organizationId: input.organizationId,
            message: error instanceof Error ? error.message : "unknown",
          },
        })
      }
    }
  }

  await db.delete(organization).where(eq(organization.id, input.organizationId))
}
