"use client"

import { useShellNavigation } from "@features/shell"
import { brandLinks } from "@packages/brand"
import Shell from "@packages/ui/components/shell"
import { useLocale, useTranslations } from "next-intl"
import { accountSectionTabs } from "../../utils/config/shell.account-section-tabs.client"
import type { ShellTranslate } from "../../utils/config/shell.messages"
import {
  ShellAccountFrame,
  ShellAccountFrameSection,
} from "./shell.account-frame"

function HelpSupportOverviewLinks() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const locale = useLocale()
  const { Link } = useShellNavigation()
  const tabs = accountSectionTabs(translate).helpSupport.filter(
    (tab) => tab.value !== "overview"
  )
  const helpCenterHref = `${brandLinks.website}/${locale}/help`

  return (
    <ul className="space-y-3">
      <li>
        <a
          className="font-medium underline"
          href={helpCenterHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("helpCenter")}
        </a>
      </li>
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

export function HelpSupportPage() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.help-support"
          description={translate("helpSupportOverviewDescription")}
          title={t("helpAndSupport")}
        >
          <HelpSupportOverviewLinks />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
