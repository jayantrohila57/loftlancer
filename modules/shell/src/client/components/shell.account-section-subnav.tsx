"use client"

import { ShellSectionSubnav } from "@features/shell"
import { useTranslations } from "next-intl"
import { accountSectionTabs } from "../../utils/config/shell.account-section-tabs.client"
import type { ShellTranslate } from "../../utils/config/shell.messages"
import { resolveAccountSectionTabValue } from "../../utils/shell.account-nav.utils"
import type { AccountSectionKey } from "../../utils/types/shell.account-section.types"

export function AccountSectionSubnav({
  section,
}: {
  readonly section: AccountSectionKey
}) {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  return (
    <ShellSectionSubnav
      resolveTabValue={resolveAccountSectionTabValue}
      tabs={accountSectionTabs(translate)[section]}
    />
  )
}
