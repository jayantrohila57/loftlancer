import { healthServiceResponseSchema } from "../utils/validation/health.validation"
import { healthService } from "./services/health.service.router"

export async function getDatabaseHealth() {
  return healthServiceResponseSchema.parse(await healthService.database())
}
