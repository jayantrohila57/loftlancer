import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"

import type { AccountSectionTabItem } from "./types/shell.account-section.types"

function accountHrefMatches(pathname: string, href: string): boolean {
  const routePath = stripLeadingLocaleFromPathname(pathname)
  if (href === "/account") {
    return routePath === href || routePath.endsWith("/account")
  }

  return routePath === href || routePath.startsWith(`${href}/`)
}

export function resolveAccountSectionTabValue(
  pathname: string,
  tabs: readonly AccountSectionTabItem[]
): string {
  const ordered = [...tabs].sort((a, b) => b.href.length - a.href.length)

  for (const tab of ordered) {
    if (accountHrefMatches(pathname, tab.href)) {
      return tab.value
    }
  }

  return tabs[0]?.value ?? "overview"
}
