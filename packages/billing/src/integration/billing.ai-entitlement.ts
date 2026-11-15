import { getDb } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

import { evaluateOrgEntitlementAiReadiness } from "./billing.ai-invoke-readiness"

export type AiEntitlementDenial =
  | "entitlement.ai_disabled"
  | "entitlement.no_credits"
  | "billing.subscription_inactive"
  | "billing.entitlement_unavailable"

export class AiEntitlementError extends Error {
  constructor(readonly code: AiEntitlementDenial) {
    super(code)
    this.name = "AiEntitlementError"
  }
}

/** A gate only: callers must also reserve credits atomically before provider use. */
export async function assertAiInvokeAllowed(organizationId: string) {
  const db = getDb()
  if (!db) throw new AiEntitlementError("billing.entitlement_unavailable")
  const [entitlement] = await db
    .select({
      aiEnabled: orgEntitlement.aiEnabled,
      balance: orgEntitlement.aiCreditBalance,
      subscriptionStatus: orgEntitlement.subscriptionStatus,
      degraded: orgEntitlement.entitlementsDegraded,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, organizationId))
    .limit(1)
  if (!entitlement)
    throw new AiEntitlementError("billing.entitlement_unavailable")

  const readiness = evaluateOrgEntitlementAiReadiness({
    aiEnabled: entitlement.aiEnabled,
    aiCreditBalance: entitlement.balance,
    subscriptionStatus: entitlement.subscriptionStatus,
    entitlementsDegraded: entitlement.degraded,
  })
  if (readiness.denialCode) throw new AiEntitlementError(readiness.denialCode)
  return { balance: entitlement.balance }
}
