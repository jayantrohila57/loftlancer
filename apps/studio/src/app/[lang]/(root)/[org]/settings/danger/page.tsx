import { isOrganizationOwnerRole } from "@modules/org"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioDangerZone } from "@/shared/org/studio-danger-zone"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgDangerPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("dangerZoneDescription")}
          title={t("dangerZone")}
        >
          <StudioDangerZone
            isOwner={isOrganizationOwnerRole(organization.role)}
            organizationId={organization.id}
            organizationSlug={organization.slug}
          />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
