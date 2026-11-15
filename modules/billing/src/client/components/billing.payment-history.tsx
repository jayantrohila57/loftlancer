import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingInvoicesTableScreen } from "./billing.invoices-table.client"

export function BillingPaymentHistoryPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.billing"
          description={t("billingPaymentHistoryDescription")}
          title={t("paymentHistory")}
        >
          <BillingInvoicesTableScreen variant="payment-history" />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
