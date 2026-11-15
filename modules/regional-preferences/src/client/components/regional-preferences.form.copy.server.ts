import { getTranslations } from "next-intl/server"
import type { RegionalFormSection } from "./regional-preferences.layout"

export async function getRegionalFormSectionCopy(section: RegionalFormSection) {
  const t = await getTranslations("regionalPreferences")
  const copy = {
    language: {
      description: t("languageDescription"),
      title: t("language"),
    },
    region: {
      description: t("regionDescription"),
      title: t("region"),
    },
    "date-time": {
      description: t("dateTimeDescription"),
      title: t("dateTimeSection"),
    },
    currency: {
      description: t("currencyDescription"),
      title: t("currency"),
    },
    numbers: {
      description: t("numberDescription"),
      title: t("grouping"),
    },
    measurements: {
      description: t("measurementDescription"),
      title: t("measurementSystem"),
    },
  } satisfies Record<
    RegionalFormSection,
    { description: string; title: string }
  >
  return copy[section]
}
