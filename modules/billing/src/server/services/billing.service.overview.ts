import { repairOrganizationProvisioningRows } from "@modules/org/server"
import { isAutumnConfigured } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { readOrgBillingOverviewRow } from "../repositories/billing.repository.overview"

export async function billingOverviewService(input: {
  organizationId: string
}) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  let row = await readOrgBillingOverviewRow({
    db,
    organizationId: input.organizationId,
  })
  if (!row) {
    await repairOrganizationProvisioningRows({
      organizationId: input.organizationId,
    })
    row = await readOrgBillingOverviewRow({
      db,
      organizationId: input.organizationId,
    })
  }
  if (!row) {
    throw new ORPCError("FORBIDDEN", {
      message: "Organization entitlements are not ready.",
      data: { code: "billing.entitlement_missing" },
    })
  }

  return createSuccess(
    {
      organizationId: input.organizationId,
      planTier: row.planTier,
      subscriptionStatus: row.subscriptionStatus,
      quotaBytes: row.quotaBytes,
      aiEnabled: row.aiEnabled,
      aiCreditBalance: row.aiCreditBalance,
      storageCreditBalance: row.storageCreditBalance,
      autumnConfigured: isAutumnConfigured(),
      autumnBound: Boolean(row.autumnCustomerId),
      provisioningStep: row.orgProvisioningStep,
      entitlementsSyncedAt: row.entitlementsSyncedAt
        ? row.entitlementsSyncedAt.toISOString()
        : null,
      entitlementsDegraded: row.entitlementsDegraded,
    },
    "Billing overview loaded."
  )
}
