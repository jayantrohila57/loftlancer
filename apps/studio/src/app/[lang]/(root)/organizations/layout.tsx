import { Building2 } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioOrganizationsSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsLayout({
  children,
  params,
}: LangLayoutProps) {
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("organizationsDashboardDescription")}
      icon={Building2}
      tabs={studioOrganizationsSectionTabs(t)}
      title={t("organizations")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
