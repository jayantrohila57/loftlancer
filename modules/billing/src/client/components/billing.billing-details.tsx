import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingDetailsScreen } from "./billing.profile.client"

export function BillingBillingDetailsPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.billing"
          description={t("billingDetailsDescription")}
          title={t("billingDetails")}
        >
          <BillingDetailsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
