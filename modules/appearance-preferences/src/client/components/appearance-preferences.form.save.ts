import { serviceResponseFailureMessage } from "@modules/auth"
import type { z } from "zod"
import type { AppearancePreferences } from "../../utils/validation/appearance-preferences.schema"
import { appearancePreferencesUpdateSchema } from "../../utils/validation/appearance-preferences.schema"
import type { AppearanceFormSection } from "./appearance-preferences.layout"

const fieldBySection = {
  theme: "theme",
  density: "interfaceDensity",
  sidebar: "sidebarBehavior",
  zoom: "zoomLevel",
} as const satisfies Record<AppearanceFormSection, keyof AppearancePreferences>

export function buildAppearanceFormUpdatePayload(
  section: AppearanceFormSection,
  rawValue: string
): Partial<AppearancePreferences> {
  const field = fieldBySection[section]
  const nextValue = rawValue ? rawValue : null
  return { [field]: nextValue }
}

type AppearanceUpdateInput = {
  payload: z.infer<typeof appearancePreferencesUpdateSchema>
}

export async function persistAppearanceFormUpdate(
  section: AppearanceFormSection,
  rawValue: string,
  update: (input: AppearanceUpdateInput) => Promise<{
    status: string
    message: string
    data?: AppearancePreferences | null
    error?: { code?: string }
  }>,
  messages: { invalid: string; saveError: string }
): Promise<AppearancePreferences> {
  const payload = buildAppearanceFormUpdatePayload(section, rawValue)
  const parsed = appearancePreferencesUpdateSchema.safeParse(payload)
  if (!parsed.success) throw new Error(messages.invalid)
  const result = await update({ payload: parsed.data })
  if (result.status !== "success" || !result.data) {
    throw new Error(
      serviceResponseFailureMessage(result, {
        invalid: messages.invalid,
        fallback: messages.saveError,
      })
    )
  }
  return result.data
}
