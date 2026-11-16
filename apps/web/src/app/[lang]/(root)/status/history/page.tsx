import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { getWebStatusPageSnapshot } from "@/shared/status/web-betterstack.client"
import { WebStatusPageHistory } from "@/shared/status/web-status-page-history"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "statusPage")
  return {
    title: t("historyMetaTitle"),
    description: t("historyMetaDescription"),
  }
}

export default async function StatusHistoryPage({ params }: LangPageProps) {
  await initRequestI18n(params)
  const snapshot = await getWebStatusPageSnapshot()
  const reports = [...snapshot.activeReports, ...snapshot.historyReports]

  return (
    <WebStatusPageHistory reports={reports} updatedAt={snapshot.updatedAt} />
  )
}
