import { isOrganizationOwnerRole } from "@modules/org"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOwnershipTransfer } from "@/shared/org/studio-ownership-transfer"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgOwnershipPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("transferOwnershipDescription")}
          title={t("transferOwnership")}
        >
          <StudioOwnershipTransfer
            isOwner={isOrganizationOwnerRole(organization.role)}
          />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
