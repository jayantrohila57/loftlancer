import { Sparkles } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioAiUsageSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgAiUsageLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("aiUsageOverviewDescription")}
      icon={Sparkles}
      tabs={studioAiUsageSectionTabs(org, t)}
      title={t("aiUsage")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
