import type { z } from "zod"
import type {
  dbHealthApiResponseSchema,
  healthCheckResultSchema,
  healthServiceResponseSchema,
} from "../validation/health.validation"

export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>
export type DbHealthApiResponse = z.infer<typeof dbHealthApiResponseSchema>
export type HealthServiceResponse = z.infer<typeof healthServiceResponseSchema>
