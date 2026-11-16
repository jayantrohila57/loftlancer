import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioGeneralSettings } from "@/shared/org/studio-general-settings"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioUnauthorized } from "@/shared/shell/studio-unauthorized"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgGeneralSettingsPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  if (!studioOrgRoleAccess(organization.role).canViewGeneral) {
    return <StudioUnauthorized params={params} />
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationSummary")}
          title={t("general")}
        >
          <StudioGeneralSettings currentSlug={org} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
