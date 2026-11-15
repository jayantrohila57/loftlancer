import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { ACTIVE_SIGN_IN_OAUTH_PROVIDERS } from "../../utils/constants/connected-accounts.constants.providers"
import { listProvidersService } from "./connected-accounts.service.providers.list"

export function signInMethodInventoryService() {
  try {
    const providersResult = listProvidersService()
    if (providersResult.status !== "success") {
      return providersResult
    }

    const availability = providersResult.data

    return createSuccess(
      {
        email: { available: true as const },
        oauth: ACTIVE_SIGN_IN_OAUTH_PROVIDERS.map((id) => ({
          id,
          configured: Boolean(availability[id]),
        })),
      },
      "Sign-in methods loaded."
    )
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "connected-accounts",
      outcome: "error",
      errorCode: "SIGN_IN_METHODS_UNAVAILABLE",
    })
    return createError("Could not load sign-in methods.", {
      code: "SIGN_IN_METHODS_UNAVAILABLE",
    })
  }
}
