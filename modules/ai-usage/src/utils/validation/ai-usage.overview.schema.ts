import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const aiUsageInvokeStatusSchema = z.enum([
  "ready",
  "ai_disabled",
  "no_credits",
  "subscription_inactive",
  "entitlement_unavailable",
  "entitlements_degraded",
])

export const aiUsageOverviewDataSchema = z.object({
  organizationId: z.string(),
  planTier: z.enum(["free", "paid"]),
  aiEnabled: z.boolean(),
  aiCreditBalance: z.number().int().nonnegative(),
  subscriptionStatus: z.string(),
  autumnConfigured: z.boolean(),
  entitlementsSyncedAt: z.string().nullable(),
  entitlementsDegraded: z.boolean(),
  invokeStatus: aiUsageInvokeStatusSchema,
  /** Remains false until a requirements amendment ships the first metered AI route. */
  meteredRoutesAvailable: z.literal(false),
  settledLedgerCount: z.number().int().nonnegative(),
  isOrgOwner: z.boolean(),
})

export const aiUsageOverviewOutputSchema = serviceResponseSchema(
  aiUsageOverviewDataSchema
)
