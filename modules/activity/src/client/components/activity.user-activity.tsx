import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecurityActivityDataManagement } from "./activity.activity.client"
import { UnifiedActivityFeed } from "./activity.unified.client"

export function SecurityUserActivityView({
  management = false,
}: {
  management?: boolean
}) {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={
            management
              ? t("manageYourStoredActivityHistory")
              : t("reviewSupportedAccountChanges")
          }
          title={management ? t("dataManagement") : t("userActivity")}
        >
          {management ? (
            <SecurityActivityDataManagement />
          ) : (
            <UnifiedActivityFeed scope="account" />
          )}
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
