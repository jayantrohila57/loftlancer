import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioOrgRolesMatrix } from "@/shared/org/studio-org-roles-matrix"
import { StudioUnauthorized } from "@/shared/shell/studio-unauthorized"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgRolesPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  if (!studioOrgRoleAccess(organization.role).canViewRoles) {
    return <StudioUnauthorized params={params} />
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationRolesMatrixDescription")}
          title={t("organizationRoles")}
        >
          <StudioOrgRolesMatrix t={t as (key: string) => string} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
