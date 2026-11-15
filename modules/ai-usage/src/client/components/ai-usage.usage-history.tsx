import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { AiUsageHistoryScreen } from "./ai-usage.usage-history.client"

export function AiUsageHistoryPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("aiUsageHistoryDescription")}
          title={t("usageHistory")}
        >
          <AiUsageHistoryScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
