import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { AiUsageModelUsageScreen } from "./ai-usage.model-usage.client"

export function AiUsageModelUsagePage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("aiUsageModelUsageBlockedDescription")}
          title={t("modelUsage")}
        >
          <AiUsageModelUsageScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
