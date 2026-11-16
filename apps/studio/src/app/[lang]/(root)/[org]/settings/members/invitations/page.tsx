import { OrgOrganizationInvitationsScreen } from "@modules/org"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgInvitationsPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("organizationInvitations")}
      description={t("organizationInvitationsSummary")}
    >
      <OrgOrganizationInvitationsScreen />
    </StudioPageSection>
  )
}
