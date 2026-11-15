import { getTranslations } from "next-intl/server"

export async function getRegionalOverviewSkeletonCopy() {
  const t = await getTranslations("regionalPreferences")
  const tUi = await getTranslations("ui")

  return {
    description: t("overviewIntro"),
    faqDescription: t("overviewFaqIntro"),
    faqLead: t("overviewFaqLead"),
    faqTitle: t("overviewFaqTitle"),
    formatsSectionDescription: t("overviewFormatsSectionDetail"),
    formatsSectionTitle: t("overviewGroupFormats"),
    localeSectionDescription: t("overviewLocaleSectionDetail"),
    localeSectionTitle: t("overviewGroupLocale"),
    title: tUi("overview"),
  }
}
