import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingClientReturnEffects } from "./billing.client-return-effects"
import { BillingOverviewScreen } from "./billing.overview.client"

export function BillingOverviewPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.billing"
          description={t("billingOverviewDescription")}
          title={t("billing")}
        >
          <BillingClientReturnEffects />
          <BillingOverviewScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
