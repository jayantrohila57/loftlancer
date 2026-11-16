import { Settings } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioSettingsSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgSettingsLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("organizationCategorySummary")}
      icon={Settings}
      tabs={studioSettingsSectionTabs(org, t)}
      title={t("organizationSettings")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
