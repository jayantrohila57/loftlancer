import { getTranslations } from "next-intl/server"
import { resolveAppearanceFormSectionCopy } from "./appearance-preferences.form.copy"
import type { AppearanceFormSection } from "./appearance-preferences.layout"

export async function getAppearanceFormSectionCopy(
  section: AppearanceFormSection
) {
  const t = await getTranslations("appearancePreferences")
  return resolveAppearanceFormSectionCopy(section, t)
}
