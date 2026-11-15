import { dbHealthApiResponseSchema } from "../utils/validation/health.validation"
import { healthRouter } from "./health.router"

/** Preserve readiness probe HTTP semantics and the existing response body. */
export async function getDbHealthResponse() {
  const result = await healthRouter.database()
  if (result.status === "success")
    return dbHealthApiResponseSchema.parse({ body: result.data, status: 200 })
  const details = result.error?.details
  return dbHealthApiResponseSchema.parse({
    body: {
      ok: false,
      error: typeof details === "string" ? details : result.message,
    },
    status: 503,
  })
}
