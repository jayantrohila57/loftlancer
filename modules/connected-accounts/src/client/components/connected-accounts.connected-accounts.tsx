import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecurityConnectedAccountsScreen } from "./connected-accounts.connected-accounts.client"

export function SecurityConnectedAccountsView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.providers"
          description={t("manageHowYouSignInToYourAccount")}
          title={t("signInMethods")}
        >
          <SecurityConnectedAccountsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
