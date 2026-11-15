import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { SecurityPermissionsScreen } from "./location.location.client"

export function SecurityPermissionsView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.permissions"
          description={t(
            "controlLocationCollectionForSignInAndSecurityActivity"
          )}
          title={t("location")}
        >
          <SecurityPermissionsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
