import { nullableText, point } from "@modules/security/utils"
import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import {
  ACTIVITY_KINDS,
  ACTIVITY_MAX_PAGE,
} from "../constants/activity.constants.activity"

export const listActivityQuerySchema = z.object({
  kind: z.enum(ACTIVITY_KINDS),
  page: z.number().int().min(0).max(ACTIVITY_MAX_PAGE),
  type: z
    .string()
    .regex(/^[a-z_]{1,60}$/)
    .optional(),
  since: z.string().datetime().optional(),
})
export const listActivityInputSchema = z.object({
  query: listActivityQuerySchema,
})
export const listActivityDataSchema = z.object({
  items: z.array(
    z.looseObject({
      id: z.string(),
      userId: z.string(),
      occurredAt: z.date(),
      type: z.string(),
      outcome: z.string(),
      ipAddress: nullableText,
      userAgent: nullableText,
      resourceType: nullableText,
      source: nullableText,
      location: point.extend({ eventId: nullableText }).nullable(),
    })
  ),
  hasMore: z.boolean(),
})

export const listActivityOutputSchema = serviceResponseSchema(
  listActivityDataSchema
)
