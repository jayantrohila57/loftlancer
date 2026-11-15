import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const aiUsageHistoryEntrySchema = z.object({
  id: z.string(),
  amount: z.number().int().positive(),
  settledAt: z.string(),
})

export const aiUsageHistoryQuerySchema = z.object({
  cursor: z.string().max(512).nullable().optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export const aiUsageHistoryInputSchema = z.object({
  query: aiUsageHistoryQuerySchema.optional(),
})

export const aiUsageHistoryDataSchema = z.object({
  organizationId: z.string(),
  meteredRoutesAvailable: z.literal(false),
  items: z.array(aiUsageHistoryEntrySchema),
  totalSettledCount: z.number().int().nonnegative(),
  nextCursor: z.string().nullable(),
})

export const aiUsageHistoryOutputSchema = serviceResponseSchema(
  aiUsageHistoryDataSchema
)
