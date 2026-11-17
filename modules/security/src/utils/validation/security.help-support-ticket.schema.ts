import { userSupportTicketStatus } from "@packages/drizzle/schema"
import { z } from "zod"

export const supportTicketCategorySchema = z.enum([
  "account",
  "billing",
  "security",
  "technical",
  "other",
])

export const supportTicketCreateSchema = z
  .object({
    category: supportTicketCategorySchema,
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(10).max(8000),
  })
  .strict()

export const supportTicketSummarySchema = z.object({
  id: z.string(),
  category: supportTicketCategorySchema,
  subject: z.string(),
  status: z.enum(userSupportTicketStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const supportTicketDetailSchema = supportTicketSummarySchema.extend({
  message: z.string(),
})

export const supportTicketListResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  data: z.array(supportTicketSummarySchema).optional(),
  error: z
    .object({
      code: z.string().optional(),
    })
    .optional(),
})

export const supportTicketDetailResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  data: supportTicketDetailSchema.optional(),
  error: z
    .object({
      code: z.string().optional(),
    })
    .optional(),
})

export const supportTicketCreateResponseSchema =
  supportTicketDetailResponseSchema
