import type { Db } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function readOrgAiUsageOverviewRow(input: {
  db: Db
  organizationId: string
}) {
  const [row] = await input.db
    .select({
      planTier: orgEntitlement.planTier,
      subscriptionStatus: orgEntitlement.subscriptionStatus,
      aiEnabled: orgEntitlement.aiEnabled,
      aiCreditBalance: orgEntitlement.aiCreditBalance,
      entitlementsSyncedAt: orgEntitlement.entitlementsSyncedAt,
      entitlementsDegraded: orgEntitlement.entitlementsDegraded,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  return row ?? null
}
