import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { z } from "zod"
import type { regionalPreferencesUpdateSchema } from "../../utils/validation/regional-preferences.schema"
import { regionalPreferencesSchema } from "../../utils/validation/regional-preferences.schema"
import {
  readRegionalPreferences,
  writeRegionalPreferences,
} from "../repositories/regional-preferences.repository"

export const regionalPreferencesService = {
  async get(userId: string) {
    try {
      const data = regionalPreferencesSchema.parse(
        await readRegionalPreferences(userId)
      )
      return createSuccess(data, "Preferences loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "regional-preferences",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not load preferences.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
  async update(
    userId: string,
    input: z.infer<typeof regionalPreferencesUpdateSchema>
  ) {
    try {
      const data = regionalPreferencesSchema.parse(
        await writeRegionalPreferences(userId, input)
      )
      return createSuccess(data, "Preferences updated.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "regional-preferences",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not update preferences.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
}
