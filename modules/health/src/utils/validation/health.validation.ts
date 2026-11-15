import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const healthCheckResultSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
})
export const healthServiceResponseSchema = serviceResponseSchema(
  healthCheckResultSchema
)
export const dbHealthApiResponseSchema = z.object({
  body: healthCheckResultSchema,
  status: z.union([z.literal(200), z.literal(503)]),
})
