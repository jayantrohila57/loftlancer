import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const aiUsageLimitsAlertsDataSchema = z.object({
  organizationId: z.string(),
  isOrgOwner: z.boolean(),
  emailDeliveryAvailable: z.boolean(),
  alertLowBalanceEnabled: z.boolean(),
  alertVeryLowBalanceEnabled: z.boolean(),
  alertDepletedEnabled: z.boolean(),
  monthlySpendCapEnabled: z.boolean(),
  monthlySpendCapCredits: z.number().int().positive().nullable(),
  presetLabels: z.object({
    lowBalance: z.string(),
    veryLowBalance: z.string(),
    depleted: z.string(),
  }),
  updatedAt: z.string().nullable(),
})

export const aiUsageLimitsAlertsOutputSchema = serviceResponseSchema(
  aiUsageLimitsAlertsDataSchema
)

export const aiUsageLimitsAlertsUpdatePayloadSchema = z
  .object({
    alertLowBalanceEnabled: z.boolean().optional(),
    alertVeryLowBalanceEnabled: z.boolean().optional(),
    alertDepletedEnabled: z.boolean().optional(),
    monthlySpendCapEnabled: z.boolean().optional(),
    monthlySpendCapCredits: z.number().int().positive().nullable().optional(),
  })
  .strict()

export const aiUsageLimitsAlertsUpdateInputSchema = z.object({
  payload: aiUsageLimitsAlertsUpdatePayloadSchema,
})

export const aiUsageLimitsAlertsUpdateOutputSchema = serviceResponseSchema(
  aiUsageLimitsAlertsDataSchema
)
