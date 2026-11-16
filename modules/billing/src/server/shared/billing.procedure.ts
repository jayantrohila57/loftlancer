import { canManageOrganizationBilling } from "@modules/org/utils/org.member-role"
import { storageOrgProcedure } from "@modules/storage/server"
import {
  BillingRateLimitError,
  enforceBillingRateLimit,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { ORPCError } from "@packages/orpc/server"
import { eq } from "drizzle-orm"

import { assertBillingOrgManager } from "./billing.owner-gate"

export const billingOrgOwnerProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    assertBillingOrgManager({
      canManageBilling: canManageOrganizationBilling(context.orgRole),
    })
    const db = getDb()
    const [row] = db
      ? await db
          .select({ planTier: orgEntitlement.planTier })
          .from(orgEntitlement)
          .where(eq(orgEntitlement.organizationId, context.organizationId))
          .limit(1)
      : []
    try {
      await enforceBillingRateLimit({
        organizationId: context.organizationId,
        planTier: row?.planTier ?? "free",
      })
    } catch (error) {
      if (error instanceof BillingRateLimitError) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: error.message,
          data: { code: "billing.rate_limited" },
        })
      }
      throw error
    }
    return next({ context })
  }
)
