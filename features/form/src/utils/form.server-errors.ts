import { FORM_MESSAGES } from "../constants/form.constants"
import type {
  MapServerErrorResult,
  ServerFieldError,
} from "../types/form.field.types"

type ErrorRecord = Record<string, unknown>

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Accept Error messages or a flat validation result. Adapt transport envelopes in the caller. */
export function mapUnknownServerError(error: unknown): MapServerErrorResult {
  const fallback = FORM_MESSAGES.unexpectedError
  if (!isRecord(error)) return { form: fallback }
  const fields: ServerFieldError[] = []
  if (isRecord(error.fieldErrors)) {
    for (const [path, messages] of Object.entries(error.fieldErrors)) {
      if (
        Array.isArray(messages) &&
        typeof messages[0] === "string" &&
        messages[0].trim() !== ""
      ) {
        fields.push({ path, message: messages[0] })
      }
    }
  }
  const firstFormError = Array.isArray(error.formErrors)
    ? error.formErrors[0]
    : undefined
  const message =
    typeof firstFormError === "string" && firstFormError.trim() !== ""
      ? firstFormError
      : fields.length === 0
        ? typeof error.message === "string" && error.message.trim() !== ""
          ? error.message
          : fallback
        : undefined
  return message ? { fields, form: message } : { fields }
}
