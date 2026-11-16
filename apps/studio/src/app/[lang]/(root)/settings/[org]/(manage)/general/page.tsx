import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioGeneralSettings } from "@/shared/org/studio-general-settings"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgGeneralSettingsPage({
  params,
}: OrgPageProps) {
  const { org } = await params
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
