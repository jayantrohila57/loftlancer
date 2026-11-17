import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { z } from "zod"
import type {
  dataExportRequestInputSchema,
  privacyConsentsUpdateSchema,
} from "../../utils/validation/privacy.schema"
import {
  dataExportRequestResultSchema,
  privacyConsentsSchema,
} from "../../utils/validation/privacy.schema"
import {
  readPrivacyConsents,
  writePrivacyConsents,
} from "../repositories/privacy.repository.consents"
import {
  createDataExportRequest,
  PrivacyDataExportRateLimitError,
} from "../repositories/privacy.repository.data-export"

export const privacyConsentsService = {
  async get(userId: string) {
    try {
      const data = privacyConsentsSchema.parse(
        await readPrivacyConsents(userId)
      )
      return createSuccess(data, "Privacy consents loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "privacy",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not load privacy consents.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
  async update(
    userId: string,
    input: z.infer<typeof privacyConsentsUpdateSchema>
  ) {
    try {
      const data = privacyConsentsSchema.parse(
        await writePrivacyConsents(userId, input)
      )
      return createSuccess(data, "Privacy consents updated.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "privacy",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not update privacy consents.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
}

export const privacyDataExportService = {
  async request(
    userId: string,
    userEmail: string,
    input: z.infer<typeof dataExportRequestInputSchema>
  ) {
    try {
      const data = dataExportRequestResultSchema.parse(
        await createDataExportRequest(userId, userEmail, input)
      )
      return createSuccess(
        data,
        "Export ready. Check your email for the download link."
      )
    } catch (error) {
      if (error instanceof PrivacyDataExportRateLimitError) {
        return createError("You can request one data export every 24 hours.", {
          code: "DATA_EXPORT_RATE_LIMITED",
        })
      }
      logger.error("service.failed", {
        app: "auth",
        module: "privacy",
        outcome: "error",
        errorCode: "EXPORT_REQUEST_FAILED",
      })
      return createError("Could not generate data export.", {
        code: "EXPORT_REQUEST_FAILED",
      })
    }
  },
}
