import {
  canManageOrganizationBilling,
  canViewOrganizationBilling,
} from "@modules/org/utils/org.member-role"
import { storageOrgProcedure } from "@modules/storage/server"
import {
  BillingRateLimitError,
  enforceBillingRateLimit,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { ORPCError } from "@packages/orpc/server"
import { eq } from "drizzle-orm"

import {
  assertBillingOrgManager,
  assertBillingOrgViewer,
} from "./billing.owner-gate"

async function enforceBillingOrgRateLimit(organizationId: string) {
  const db = getDb()
  const [row] = db
    ? await db
        .select({ planTier: orgEntitlement.planTier })
        .from(orgEntitlement)
        .where(eq(orgEntitlement.organizationId, organizationId))
        .limit(1)
    : []
  try {
    await enforceBillingRateLimit({
      organizationId,
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
}

export const billingOrgViewProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    assertBillingOrgViewer({
      canViewBilling: canViewOrganizationBilling(context.orgRole),
    })
    return next({ context })
  }
)

export const billingOrgManageProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    assertBillingOrgManager({
      canManageBilling: canManageOrganizationBilling(context.orgRole),
    })
    await enforceBillingOrgRateLimit(context.organizationId)
    return next({ context })
  }
)

/** @deprecated Use {@link billingOrgManageProcedure}. */
export const billingOrgOwnerProcedure = billingOrgManageProcedure
