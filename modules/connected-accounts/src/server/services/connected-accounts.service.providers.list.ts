import { readSocialProviderAvailability } from "@packages/better-auth"
import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"

export function listProvidersService() {
  try {
    return createSuccess(readSocialProviderAvailability(), "Providers loaded.")
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "connected-accounts",
      outcome: "error",
      errorCode: "PROVIDERS_UNAVAILABLE",
    })
    return createError("Could not load sign-in providers.", {
      code: "PROVIDERS_UNAVAILABLE",
    })
  }
}
