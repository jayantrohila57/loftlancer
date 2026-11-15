import type { Db } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function readOrgBillingOverviewRow(input: {
  db: Db
  organizationId: string
}) {
  const [row] = await input.db
    .select({
      planTier: orgEntitlement.planTier,
      subscriptionStatus: orgEntitlement.subscriptionStatus,
      quotaBytes: orgEntitlement.quotaBytes,
      aiEnabled: orgEntitlement.aiEnabled,
      aiCreditBalance: orgEntitlement.aiCreditBalance,
      storageCreditBalance: orgEntitlement.storageCreditBalance,
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      orgProvisioningStep: orgEntitlement.orgProvisioningStep,
      entitlementsSyncedAt: orgEntitlement.entitlementsSyncedAt,
      entitlementsDegraded: orgEntitlement.entitlementsDegraded,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  return row ?? null
}
