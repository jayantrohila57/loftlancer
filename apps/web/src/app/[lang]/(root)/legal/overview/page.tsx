import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { WebLegalOverviewPage } from "@/shared/legal/web-legal-overview-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "legal")
  return {
    title: t("overview.title"),
    description: t("overview.description"),
  }
}

export default async function LegalOverviewPage(props: LangPageProps) {
  return WebLegalOverviewPage(props)
}
