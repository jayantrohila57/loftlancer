"use client"

import {
  createNavigationRegistry,
  defineHomeNavigationItems,
  toShellSidebarNavGroups,
} from "@features/navigation"
import { ShellSidebarNav } from "@features/shell"
import { CreditCard, Users } from "lucide-react"
import { useTranslations } from "next-intl"

export function ConsoleSidebarNav() {
  const t = useTranslations("ui")
  const registry = createNavigationRegistry({
    items: [
      ...defineHomeNavigationItems({
        groupLabel: t("console"),
        homeDescription: t("consoleHomeDescription"),
        homeLabel: t("home"),
      }),
      {
        description: t("billingOverviewDescription"),
        groupId: "home-root",
        groupLabel: t("console"),
        href: "/users",
        icon: Users,
        id: "users",
        label: t("consoleUsersNav"),
        order: 10,
        placements: ["sidebar", "command"],
        keywords: ["users", "admin"],
      },
      {
        description: t("billingAdminDescription"),
        groupId: "home-root",
        groupLabel: t("console"),
        href: "/billing",
        icon: CreditCard,
        id: "billing",
        label: t("billingAdminTitle"),
        order: 20,
        placements: ["sidebar", "command"],
        keywords: ["billing", "plan", "grant"],
      },
    ],
  })

  return <ShellSidebarNav groups={toShellSidebarNavGroups(registry)} />
}
