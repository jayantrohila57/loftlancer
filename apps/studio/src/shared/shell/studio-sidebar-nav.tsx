"use client"

import {
  createNavigationRegistry,
  toShellSidebarNavGroups,
} from "@features/navigation"
import { ShellSidebarNav } from "@features/shell"
import { useTranslations } from "next-intl"
import { usePathname } from "@/shared/i18n/studio.i18n"
import { readOrgSlugFromPathname } from "@/shared/org/studio-org.paths"
import { studioOrgNavigationItems } from "@/shared/shell/studio-org-nav"
import { StudioOrgSwitcher } from "@/shared/shell/studio-org-switcher"

export function StudioSidebarNav() {
  const t = useTranslations("ui")
  const tCommand = useTranslations("command")
  const pathname = usePathname()
  const slug = readOrgSlugFromPathname(pathname)
  const registry = createNavigationRegistry({
    items: studioOrgNavigationItems({ slug, t, tCommand }),
  })

  return (
    <ShellSidebarNav
      leading={<StudioOrgSwitcher />}
      groups={toShellSidebarNavGroups(registry)}
    />
  )
}
