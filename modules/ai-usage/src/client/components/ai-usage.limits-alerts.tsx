import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { AiUsageLimitsAlertsScreen } from "./ai-usage.limits-alerts.client"

export function AiUsageLimitsAlertsPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("aiUsageLimitsAlertsDescription")}
          title={t("limitsAndAlerts")}
        >
          <AiUsageLimitsAlertsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
