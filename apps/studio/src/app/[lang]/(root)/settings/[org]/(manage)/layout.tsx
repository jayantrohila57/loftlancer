import { Settings } from "lucide-react"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioSettingsSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgManageSettingsLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  const access = studioOrgRoleAccess(organization.role)
  return (
    <StudioOrgSectionLayout
      description={t("organizationCategorySummary")}
      icon={Settings}
      tabs={studioSettingsSectionTabs(org, t, access)}
      title={t("organizationSettings")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
