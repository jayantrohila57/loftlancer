import { WhatsNewPage } from "@modules/whats-new"
import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "whatsNew")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default WhatsNewPage
