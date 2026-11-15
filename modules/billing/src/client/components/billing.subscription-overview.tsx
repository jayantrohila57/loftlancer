import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingClientReturnEffects } from "./billing.client-return-effects"
import { BillingSubscriptionSummaryScreen } from "./billing.subscription-summary.client"

export function BillingSubscriptionOverviewPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.subscription"
          description={t("subscriptionOverviewDescription")}
          title={t("subscription")}
        >
          <BillingClientReturnEffects />
          <BillingSubscriptionSummaryScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
