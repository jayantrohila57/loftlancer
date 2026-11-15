import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import {
  AuthAccountOverviewManage,
  AuthAccountOverviewSummary,
} from "./auth.account-overview.client"

export function AuthAccountOverviewView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("yourAccountInformation")}
          title={t("accountSummary")}
        >
          <AuthAccountOverviewSummary />
        </ShellAccountFrameSection>
        <ShellAccountFrameSection
          description={t("profileAndSecuritySettings")}
          title={t("manageAccount")}
        >
          <AuthAccountOverviewManage />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
