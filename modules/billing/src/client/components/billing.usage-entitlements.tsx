import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { BillingUsageEntitlementsScreen } from "./billing.usage-entitlements.client"

export function BillingUsageEntitlementsPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.subscription"
          description={t("billingUsageEntitlementsDescription")}
          title={t("usageAndEntitlements")}
        >
          <BillingUsageEntitlementsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
