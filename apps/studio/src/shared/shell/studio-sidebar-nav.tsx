"use client"

import {
  createNavigationRegistry,
  toShellSidebarNavGroups,
} from "@features/navigation"
import { ShellSidebarNav } from "@features/shell"
import { useOrgActiveMemberRole } from "@modules/org"
import { useTranslations } from "next-intl"
import { usePathname } from "@/shared/i18n/studio.i18n"
import {
  readOrgSlugFromPathname,
  readStudioNavArea,
} from "@/shared/org/studio-org.paths"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioOrgSwitcher } from "@/shared/shell/studio-org-switcher"
import { studioOrganizationsNavigationItems } from "@/shared/shell/studio-organizations-nav"
import { studioSettingsNavigationItems } from "@/shared/shell/studio-settings-nav"
import { studioWorkspaceNavigationItems } from "@/shared/shell/studio-workspace-nav"

export function StudioSidebarNav() {
  const t = useTranslations("ui")
  const tCommand = useTranslations("command")
  const pathname = usePathname()
  const slug = readOrgSlugFromPathname(pathname)
  const area = readStudioNavArea(pathname)
  const { role, isPending: rolePending } = useOrgActiveMemberRole()
  const translate = t as unknown as (key: string) => string
  const translateCommand = tCommand as unknown as (key: string) => string
  const access = role ? studioOrgRoleAccess(role) : null

  const items =
    area === "organizations"
      ? studioOrganizationsNavigationItems({
          t: translate,
          tCommand: translateCommand,
        })
      : area === "settings"
        ? studioSettingsNavigationItems({
            slug,
            access,
            rolePending,
            t: translate,
          })
        : studioWorkspaceNavigationItems({
            slug,
            t: translate,
            tCommand: translateCommand,
          })

  const registry = createNavigationRegistry({ items })

  return (
    <ShellSidebarNav
      leading={<StudioOrgSwitcher />}
      groups={toShellSidebarNavGroups(registry)}
    />
  )
}
