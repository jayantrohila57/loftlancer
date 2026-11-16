import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const billingOverviewDataSchema = z.object({
  organizationId: z.string(),
  planTier: z.enum(["free", "paid"]),
  subscriptionStatus: z.enum([
    "active",
    "past_due",
    "canceled",
    "trialing",
    "incomplete",
  ]),
  quotaBytes: z.number().int().positive(),
  aiEnabled: z.boolean(),
  aiCreditBalance: z.number().int().nonnegative(),
  storageCreditBalance: z.number().int().nonnegative(),
  autumnConfigured: z.boolean(),
  autumnBound: z.boolean(),
  provisioningStep: z.enum([
    "created",
    "storage_root",
    "entitlement_cache",
    "autumn_bound",
    "complete",
  ]),
  entitlementsSyncedAt: z.string().datetime().nullable(),
  entitlementsDegraded: z.boolean(),
  paymentGraceUntil: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  usedBytes: z.number().int().nonnegative(),
  organizationLimit: z.number().int().nonnegative(),
  aiCreditsIncluded: z.number().int().nonnegative(),
})

export const billingOverviewOutputSchema = serviceResponseSchema(
  billingOverviewDataSchema
)

export const billingUpgradeOutputSchema = serviceResponseSchema(
  z.object({
    paymentUrl: z.union([z.string().url(), z.null()]),
    planTier: z.enum(["free", "paid"]),
  })
)

export const billingPortalOutputSchema = serviceResponseSchema(
  z.object({
    portalUrl: z.string().url(),
  })
)

export const billingCancelOutputSchema = serviceResponseSchema(
  z.object({
    cancelAtPeriodEnd: z.literal(true),
  })
)
