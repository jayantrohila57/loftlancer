import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"

import type { ShellSectionTabItem } from "../types/shell-nav.types"

function shellHrefMatches(pathname: string, href: string): boolean {
  const routePath = stripLeadingLocaleFromPathname(pathname)
  if (href === "/account") return routePath === href
  return routePath === href || routePath.startsWith(`${href}/`)
}

export function isShellSidebarHrefActive(
  pathname: string,
  href: string
): boolean {
  return shellHrefMatches(pathname, href)
}

/** One sub-item active: longest matching href wins (overview must not match sub-routes). */
export function isShellSidebarSubItemActive(
  pathname: string,
  href: string,
  subItems: readonly { readonly href: string }[]
): boolean {
  const ordered = [...subItems].sort((a, b) => b.href.length - a.href.length)

  for (const sub of ordered) {
    if (shellHrefMatches(pathname, sub.href)) {
      return sub.href === href
    }
  }

  return false
}

export function resolveShellSectionTabValue(
  pathname: string,
  tabs: readonly ShellSectionTabItem[]
): string {
  const ordered = [...tabs].sort((a, b) => b.href.length - a.href.length)

  for (const tab of ordered) {
    if (shellHrefMatches(pathname, tab.href)) {
      return tab.value
    }
  }

  return tabs[0]?.value ?? "overview"
}
