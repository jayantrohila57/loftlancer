import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { useTranslations } from "next-intl"

import { AccountHeaderAction } from "@/shared/shell/account-header-action"

export function SecurityAccountSections() {
  const t = useTranslations("ui")

  return (
    <ShellAccountFrame>
      <ShellAccountFrameSection
        description={t("devicesThatAreCurrentlySignedIn")}
        title={t("sessions")}
      >
        <AccountHeaderAction
          href="/account/security/sessions"
          label={t("manageSessions")}
        />
      </ShellAccountFrameSection>
      <ShellAccountFrameSection
        description={t("appsThatCanSignYouIn")}
        title={t("connectedAccounts")}
      >
        <AccountHeaderAction
          href="/account/security/connected-accounts"
          label={t("viewConnectedAccounts")}
        />
      </ShellAccountFrameSection>
    </ShellAccountFrame>
  )
}
