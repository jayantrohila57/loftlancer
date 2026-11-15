import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecurityDeviceAuthorizationScreen } from "./device-authorization.device-authorization.client"

export function SecurityDeviceAuthorizationView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.security.device-authorization"
          description={t("deviceAuthorizationPageDescription")}
          title={t("deviceAuthorization")}
        >
          <SecurityDeviceAuthorizationScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
