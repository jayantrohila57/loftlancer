import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { z } from "zod"
import type { appearancePreferencesUpdateSchema } from "../../utils/validation/appearance-preferences.schema"
import { appearancePreferencesSchema } from "../../utils/validation/appearance-preferences.schema"
import {
  readAppearancePreferences,
  writeAppearancePreferences,
} from "../repositories/appearance-preferences.repository"

export const appearancePreferencesService = {
  async get(userId: string) {
    try {
      const data = appearancePreferencesSchema.parse(
        await readAppearancePreferences(userId)
      )
      return createSuccess(data, "Preferences loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "appearance-preferences",
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
    input: z.infer<typeof appearancePreferencesUpdateSchema>
  ) {
    try {
      const data = appearancePreferencesSchema.parse(
        await writeAppearancePreferences(userId, input)
      )
      return createSuccess(data, "Preferences updated.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "appearance-preferences",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not update preferences.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
}
