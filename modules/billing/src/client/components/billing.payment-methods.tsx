import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingClientReturnEffects } from "./billing.client-return-effects"
import { BillingPaymentMethodsScreen } from "./billing.profile.client"

export function BillingPaymentMethodsPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.billing"
          description={t("billingPaymentMethodsDescription")}
          title={t("paymentMethods")}
        >
          <BillingClientReturnEffects />
          <BillingPaymentMethodsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
