import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecuritySessionsScreen } from "./sessions.sessions.client"

export function SecuritySessionsView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.sessions"
          description={t("devicesCurrentlySignedInToYourAccount")}
          title={t("activeSessions")}
        >
          <SecuritySessionsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
