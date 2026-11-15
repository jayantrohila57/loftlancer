import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

const key = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z][a-z0-9_.-]*$/)
export const activityOutcomeSchema = z.enum([
  "success",
  "denied",
  "failed",
  "error",
  "unknown",
])
export const activityFeedQuerySchema = z
  .object({
    scope: z.enum(["account", "security", "resource"]).optional(),
    category: key.optional(),
    actionId: key.optional(),
    outcome: activityOutcomeSchema.optional(),
    sourceModule: key.optional(),
    since: z.string().datetime().optional(),
    until: z.string().datetime().optional(),
    cursor: z.string().min(1).max(2000).optional(),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .strict()
  .refine(
    (value) => !value.since || !value.until || value.since <= value.until,
    { message: "Invalid date interval" }
  )
export const activityFeedInputSchema = z
  .object({ query: activityFeedQuerySchema })
  .strict()
export const activityDetailInputSchema = z
  .object({
    query: z.object({ activityId: z.string().min(1).max(256) }).strict(),
  })
  .strict()
export const activityClearInputSchema = z
  .object({
    payload: z.discriminatedUnion("scope", [
      z.object({ scope: z.literal("all") }).strict(),
      z.object({ scope: z.literal("category"), category: key }).strict(),
      z.object({ scope: z.literal("security") }).strict(),
      z.object({ scope: z.literal("account") }).strict(),
    ]),
  })
  .strict()

const values = z.record(z.string(), z.unknown()).nullable()
export const activityItemSchema = z.object({
  activityId: z.string(),
  actionId: z.string(),
  category: z.string(),
  schemaVersion: z.number(),
  actorType: z.enum(["user", "system", "integration", "unknown"]),
  actorUserId: z.string().nullable(),
  actorName: z.string().nullable(),
  actorImage: z.string().nullable(),
  outcome: activityOutcomeSchema,
  occurredAt: z.date(),
  recordedAt: z.date(),
  sourceApp: z.string().nullable(),
  sourceModule: z.string().nullable(),
  resourceType: z.string().nullable(),
  resourceId: z.string().nullable(),
  beforeValue: values,
  afterValue: values,
  metadata: values,
  canViewTarget: z.boolean(),
  targetUrl: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
})
export const activityFeedOutputSchema = serviceResponseSchema(
  z.object({
    items: z.array(activityItemSchema),
    nextCursor: z.string().nullable(),
  })
)
export const activityDetailOutputSchema = serviceResponseSchema(
  activityItemSchema.extend({
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        accuracyMeters: z.number(),
      })
      .nullable(),
  })
)
export const activityClearOutputSchema = serviceResponseSchema(
  z.object({ deleted: z.boolean() })
)
export type ActivityFeedQuery = z.infer<typeof activityFeedQuerySchema>
export type ActivityClearPayload = z.infer<
  typeof activityClearInputSchema
>["payload"]
