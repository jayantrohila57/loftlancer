import {
  BILLING_FREE_PLAN_QUOTA_BYTES,
  BILLING_PAID_PLAN_QUOTA_BYTES,
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { readOrgBillingOverviewRow } from "../repositories/billing.repository.overview"

export async function billingListPlansService(input: {
  organizationId: string
}) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const row = await readOrgBillingOverviewRow({
    db,
    organizationId: input.organizationId,
  })
  if (!row) {
    throw new ORPCError("FORBIDDEN", {
      message: "Organization entitlements are not ready.",
      data: { code: "billing.entitlement_missing" },
    })
  }

  const freePlanId = resolveAutumnPlanIdFree()
  const paidPlanId = resolveAutumnPlanIdPaid()
  const currentPlanTier = row.planTier

  return createSuccess(
    {
      currentPlanTier,
      plans: [
        {
          planId: freePlanId,
          tier: "free" as const,
          quotaBytes: BILLING_FREE_PLAN_QUOTA_BYTES,
          aiEnabled: false,
          isCurrent: currentPlanTier === "free",
        },
        {
          planId: paidPlanId,
          tier: "paid" as const,
          quotaBytes: BILLING_PAID_PLAN_QUOTA_BYTES,
          aiEnabled: true,
          isCurrent: currentPlanTier === "paid",
        },
      ],
    },
    "Available plans loaded."
  )
}
