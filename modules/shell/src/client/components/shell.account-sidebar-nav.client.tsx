"use client"

import { ShellSidebarNav } from "@features/shell"
import { useOrgBillingNavVisible } from "@modules/org"
import { useTranslations } from "next-intl"
import { accountSidebarNavGroups } from "../../utils/config/shell.account-nav.config"
import type { ShellTranslate } from "../../utils/config/shell.messages"
import { ShellOrgSwitcherLoader } from "./shell.org-switcher-loader"

export function AccountSidebarNavContent() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const showBilling = useOrgBillingNavVisible()
  return (
    <ShellSidebarNav
      leading={<ShellOrgSwitcherLoader />}
      groups={accountSidebarNavGroups(translate, {
        showBillingNav: showBilling,
      })}
    />
  )
}
