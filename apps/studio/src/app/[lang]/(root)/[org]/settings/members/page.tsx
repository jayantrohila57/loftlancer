import { OrgMembersScreen } from "@modules/org"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgMembersPage({ params }: OrgPageProps) {
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationMembersSummary")}
          title={t("organizationMembers")}
        >
          <OrgMembersScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
