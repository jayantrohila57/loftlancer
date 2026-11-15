import { isInvalidInputServiceResponse } from "@modules/auth"
import type { RegionalPreferences } from "../../utils/validation/regional-preferences.schema"
import { regionalPreferencesUpdateSchema } from "../../utils/validation/regional-preferences.schema"
import type { RegionalFormSection } from "./regional-preferences.layout"

export type RegionalFormValues = {
  extra: string
  hourCycle: string
  value: string
}

const sectionPrimaryField = {
  currency: "currency",
  language: "language",
  measurements: "measurementSystem",
  numbers: "numberGrouping",
  region: "region",
} as const satisfies Record<
  Exclude<RegionalFormSection, "date-time">,
  keyof RegionalPreferences
>

export function buildRegionalFormUpdatePayload(
  section: RegionalFormSection,
  values: RegionalFormValues
): Record<string, string | null> {
  if (section === "date-time") {
    return {
      timeZone: values.value ? values.value : null,
      dateStyle: values.extra ? values.extra : null,
      hourCycle: values.hourCycle ? values.hourCycle : null,
    }
  }
  const field = sectionPrimaryField[section]
  return { [field]: values.value ? values.value : null }
}

export function parseRegionalFormUpdate(
  section: RegionalFormSection,
  values: RegionalFormValues
) {
  return regionalPreferencesUpdateSchema.safeParse(
    buildRegionalFormUpdatePayload(section, values)
  )
}

export function regionalSaveErrorMessage(
  result: { status: string; message: string; error?: { code?: string } },
  invalid: string,
  saveError: string,
  parsed: ReturnType<typeof parseRegionalFormUpdate>
): string | null {
  if (!parsed.success) return invalid
  if (result.status !== "success") {
    if (isInvalidInputServiceResponse(result)) {
      return result.message?.trim() || invalid
    }
    return saveError
  }
  return null
}
