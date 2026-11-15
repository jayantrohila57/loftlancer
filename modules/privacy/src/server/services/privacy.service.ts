import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { sendResendEmail } from "@packages/resend"
import { serverEnv } from "@packages/t3-env/server"
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
import { createDataExportRequest } from "../repositories/privacy.repository.data-export"

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
    input: z.infer<typeof dataExportRequestInputSchema>
  ) {
    try {
      if (!serverEnv.SUPPORT_EMAIL || !serverEnv.RESEND_API_KEY) {
        throw new Error("Support email delivery is not configured")
      }
      const data = dataExportRequestResultSchema.parse(
        await createDataExportRequest(userId, input)
      )
      const escapeHtml = (value: string) =>
        value.replace(/[&<>"']/g, (character) => {
          switch (character) {
            case "&":
              return "&amp;"
            case "<":
              return "&lt;"
            case ">":
              return "&gt;"
            case '"':
              return "&quot;"
            default:
              return "&#39;"
          }
        })
      await sendResendEmail({
        to: serverEnv.SUPPORT_EMAIL,
        subject: "Account data export request",
        html: `<p>An account data export was requested.</p><p>Request: ${escapeHtml(data.requestId)}<br>User: ${escapeHtml(userId)}<br>Submitted: ${escapeHtml(data.submittedAt)}</p><p>Message: ${escapeHtml(input.message?.trim() || "None")}</p>`,
      })
      return createSuccess(data, "Export request submitted.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "privacy",
        outcome: "error",
        errorCode: "EXPORT_REQUEST_FAILED",
      })
      return createError("Could not submit export request.", {
        code: "EXPORT_REQUEST_FAILED",
      })
    }
  },
}
