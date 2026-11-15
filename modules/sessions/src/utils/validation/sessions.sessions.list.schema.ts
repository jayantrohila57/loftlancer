import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

const nullableText = z.string().nullable()

export const listSessionsDataSchema = z.array(
  z.object({
    id: z.string(),
    token: z.string(),
    userId: z.string(),
    expiresAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
    ipAddress: nullableText,
    userAgent: nullableText,
  })
)

export const listSessionsOutputSchema = serviceResponseSchema(
  listSessionsDataSchema
)
