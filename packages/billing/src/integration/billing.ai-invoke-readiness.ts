import type { AiEntitlementDenial } from "./billing.ai-entitlement"

/** UI invoke status labels (Account AI usage overview). */
export type AiInvokeStatus =
  | "ready"
  | "ai_disabled"
  | "no_credits"
  | "subscription_inactive"
  | "entitlement_unavailable"
  | "entitlements_degraded"

export type OrgEntitlementAiCacheRow = {
  aiEnabled: boolean
  aiCreditBalance: number
  subscriptionStatus: string
  entitlementsDegraded: boolean
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"])

/** Single evaluation of org entitlement cache for AI invoke UI and gates. */
export function evaluateOrgEntitlementAiReadiness(
  row: OrgEntitlementAiCacheRow
): {
  invokeStatus: AiInvokeStatus
  denialCode: AiEntitlementDenial | null
} {
  if (row.entitlementsDegraded) {
    return {
      invokeStatus: "entitlements_degraded",
      denialCode: "billing.entitlement_unavailable",
    }
  }
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(row.subscriptionStatus)) {
    return {
      invokeStatus: "subscription_inactive",
      denialCode: "billing.subscription_inactive",
    }
  }
  if (!row.aiEnabled) {
    return {
      invokeStatus: "ai_disabled",
      denialCode: "entitlement.ai_disabled",
    }
  }
  if (row.aiCreditBalance <= 0) {
    return {
      invokeStatus: "no_credits",
      denialCode: "entitlement.no_credits",
    }
  }
  return { invokeStatus: "ready", denialCode: null }
}
