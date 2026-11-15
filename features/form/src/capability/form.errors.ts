import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import type { MapServerErrorResult } from "../types/form.field.types"

/** Apply mapped errors to this form and return the first field to focus after submission ends. */
export function applyServerErrors<TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  result: MapServerErrorResult
): Path<TValues> | undefined {
  const normalized = Array.isArray(result) ? { fields: result } : result
  if (normalized.form)
    setError("root.server", { type: "server", message: normalized.form })
  for (const field of normalized.fields ?? []) {
    setError(field.path as Path<TValues>, {
      type: "server",
      message: field.message,
    })
  }
  return normalized.fields?.[0]?.path as Path<TValues> | undefined
}
