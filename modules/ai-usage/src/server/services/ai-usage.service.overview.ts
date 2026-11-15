import {
  evaluateOrgEntitlementAiReadiness,
  isAutumnConfigured,
} from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { readOrgAiUsageHistory } from "../repositories/ai-usage.repository.history"
import { readOrgAiUsageOverviewRow } from "../repositories/ai-usage.repository.overview"

export async function aiUsageOverviewService(input: {
  organizationId: string
  isOrgOwner: boolean
}) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const row = await readOrgAiUsageOverviewRow({
    db,
    organizationId: input.organizationId,
  })
  if (!row) {
    throw new ORPCError("FORBIDDEN", {
      message: "Organization entitlements are not ready.",
      data: { code: "billing.entitlement_missing" },
    })
  }

  const history = await readOrgAiUsageHistory({
    db,
    organizationId: input.organizationId,
  })

  return createSuccess(
    {
      organizationId: input.organizationId,
      planTier: row.planTier,
      aiEnabled: row.aiEnabled,
      aiCreditBalance: row.aiCreditBalance,
      subscriptionStatus: row.subscriptionStatus,
      autumnConfigured: isAutumnConfigured(),
      entitlementsSyncedAt: row.entitlementsSyncedAt
        ? row.entitlementsSyncedAt.toISOString()
        : null,
      entitlementsDegraded: row.entitlementsDegraded,
      invokeStatus: evaluateOrgEntitlementAiReadiness({
        aiEnabled: row.aiEnabled,
        aiCreditBalance: row.aiCreditBalance,
        subscriptionStatus: row.subscriptionStatus,
        entitlementsDegraded: row.entitlementsDegraded,
      }).invokeStatus,
      meteredRoutesAvailable: false as const,
      settledLedgerCount: history.totalSettledCount,
      isOrgOwner: input.isOrgOwner,
    },
    "AI usage overview loaded."
  )
}
