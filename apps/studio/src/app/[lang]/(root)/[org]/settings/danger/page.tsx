import { isOrganizationOwnerRole } from "@modules/org"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioDangerZone } from "@/shared/org/studio-danger-zone"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgDangerPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("dangerZone")}
      description={t("dangerZoneDescription")}
    >
      <StudioDangerZone
        organizationId={organization.id}
        organizationSlug={organization.slug}
        isOwner={isOrganizationOwnerRole(organization.role)}
      />
    </StudioPageSection>
  )
}
