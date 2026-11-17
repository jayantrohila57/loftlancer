"use client"

import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import { useShellNavigation } from "@features/shell"

function readOrgSlugFromPathname(pathname: string): string | null {
  const parts = stripLeadingLocaleFromPathname(pathname)
    .split("/")
    .filter(Boolean)
  if (parts[0] === "settings") return parts[1] ?? null
  if (
    parts[0] === "organizations" ||
    parts[0] === "onboarding" ||
    parts[0] === "invite"
  ) {
    return null
  }
  return parts[0] ?? null
}

function resolveAccountHubHref(pathname: string, href: string): string {
  const slug = readOrgSlugFromPathname(pathname)
  if (!slug) {
    return href.startsWith("/account/") ? "/organizations" : href
  }
  switch (href) {
    case "/account/billing":
      return `/settings/${slug}/billing`
    case "/account/storage/files":
      return `/${slug}/usage/storage/files`
    default:
      return href
  }
}

export function useAccountHubHref(href: string): string {
  const { usePathname } = useShellNavigation()
  const pathname = usePathname()
  return resolveAccountHubHref(pathname, href)
}
