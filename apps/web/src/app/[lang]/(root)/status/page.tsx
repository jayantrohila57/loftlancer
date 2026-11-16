import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { getWebStatusPageSnapshot } from "@/shared/status/web-betterstack.client"
import { worstAggregateLevel } from "@/shared/status/web-betterstack.mapper"
import { WebStatusPageLayout } from "@/shared/status/web-status-page-layout"
import { WebStatusPageOverview } from "@/shared/status/web-status-page-overview"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "statusPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function StatusPage({ params }: LangPageProps) {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "statusPage")
  const loaded = await getWebStatusPageSnapshot()
  const aggregateState =
    loaded.aggregateState === "unknown"
      ? worstAggregateLevel(loaded)
      : loaded.aggregateState
  const snapshot = { ...loaded, aggregateState }

  const copy = {
    overviewTab: t("overviewTab"),
    historyTab: t("historyTab"),
    updatedPrefix: t("updatedPrefix"),
    updatedAtEmpty: t("updatedAtEmpty"),
    daysLabel: t("daysLabel"),
    noIncidentsTitle: t("noIncidentsTitle"),
    noIncidentsBody: t("noIncidentsBody"),
    incidentsTitle: t("incidentsTitle"),
    incidentStatusAt: (status: string, time: string) =>
      t("incidentStatusAt", { status, time }),
    banner: {
      operational: {
        title: t("bannerOperationalTitle"),
        description: t("bannerOperationalDescription"),
      },
      degraded: {
        title: t("bannerDegradedTitle"),
        description: t("bannerDegradedDescription"),
      },
      outage: {
        title: t("bannerOutageTitle"),
        description: t("bannerOutageDescription"),
      },
      unknown: {
        title: t("bannerUnknownTitle"),
        description: t("bannerUnknownDescription"),
      },
    },
    groups: {
      website: t("groups.website"),
      auth: t("groups.auth"),
      studio: t("groups.studio"),
      console: t("groups.console"),
      api: t("groups.api"),
    },
  }

  return (
    <WebStatusPageLayout
      eyebrow={t("eyebrow")}
      subtitle={t("subtitle")}
      title={t("title")}
    >
      <WebStatusPageOverview copy={copy} snapshot={snapshot} />
    </WebStatusPageLayout>
  )
}
