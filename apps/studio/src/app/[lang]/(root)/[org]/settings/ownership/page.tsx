import { isOrganizationOwnerRole } from "@modules/org"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOwnershipTransfer } from "@/shared/org/studio-ownership-transfer"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgOwnershipPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("transferOwnership")}
      description={t("transferOwnershipDescription")}
    >
      <StudioOwnershipTransfer
        isOwner={isOrganizationOwnerRole(organization.role)}
      />
    </StudioPageSection>
  )
}
