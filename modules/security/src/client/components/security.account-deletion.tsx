import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecurityAccountDeletionScreen } from "./security.account-deletion.client"

export { SecurityAccountDeletionScreen }

export function SecurityAccountDeletionView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.deletion"
          description={t("deleteAccountPageDescription")}
          title={t("accountDeletion")}
        >
          <SecurityAccountDeletionScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
