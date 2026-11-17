import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const banUserInputSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().trim().min(1).max(500).optional(),
  banExpiresAt: z.coerce.date().optional(),
})

export const unbanUserInputSchema = z.object({
  userId: z.string().min(1),
})

const adminUserActionDataSchema = z.object({
  userId: z.string(),
  banned: z.boolean(),
})

export const adminUserActionOutputSchema = serviceResponseSchema(
  adminUserActionDataSchema
)
