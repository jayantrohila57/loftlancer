import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"
import { UnifiedActivityFeed } from "./activity.unified.client"

export function ActivityOverviewView() {
  const t = useTranslations("ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          title={t("overview")}
          description={t("activityCategorySummary")}
        >
          <UnifiedActivityFeed />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
export function ActivityResourceView() {
  const t = useTranslations("ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          title={t("resourceActivity")}
          description={t("resourceActivityUnavailable")}
        >
          <UnifiedActivityFeed scope="resource" />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
