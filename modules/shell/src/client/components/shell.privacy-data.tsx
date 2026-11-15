"use client"

import { useShellNavigation } from "@features/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"
import { accountSectionTabs } from "../../utils/config/shell.account-section-tabs.client"
import type { ShellTranslate } from "../../utils/config/shell.messages"
import {
  ShellAccountFrame,
  ShellAccountFrameSection,
} from "./shell.account-frame"

function PrivacyDataOverviewLinks() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const { Link } = useShellNavigation()
  const tabs = accountSectionTabs(translate).privacyData.filter(
    (tab) => tab.value !== "overview"
  )

  return (
    <ul className="space-y-3">
      {tabs.map((tab) => (
        <li key={tab.href}>
          <Link className="font-medium underline" href={tab.href}>
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function PrivacyDataPage() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.privacy-data"
          description={t("managePrivacyConsentsExportAndAccountDeletion")}
          title={t("privacyAndData")}
        >
          <PrivacyDataOverviewLinks />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
