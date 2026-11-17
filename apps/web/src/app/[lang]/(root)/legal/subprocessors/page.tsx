import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { WebLegalDocumentPage } from "@/shared/legal/web-legal-document-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "legal")
  return {
    title: t("subprocessors.title"),
    description: t("subprocessors.description"),
  }
}

export default async function LegalSubprocessorsPage(props: LangPageProps) {
  return WebLegalDocumentPage({ ...props, document: "subprocessors" })
}
