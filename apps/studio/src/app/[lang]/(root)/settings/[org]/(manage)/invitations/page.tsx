import { OrgOrganizationInvitationsScreen } from "@modules/org"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioUnauthorized } from "@/shared/shell/studio-unauthorized"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgInvitationsPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  if (!studioOrgRoleAccess(organization.role).canManageInvitations) {
    return <StudioUnauthorized params={params} />
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationInvitationsSummary")}
          title={t("organizationInvitations")}
        >
          <OrgOrganizationInvitationsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
