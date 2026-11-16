"use client"

import {
  createNavigationRegistry,
  defineHomeNavigationItems,
  toShellSidebarNavGroups,
} from "@features/navigation"
import { ShellSidebarNav } from "@features/shell"
import { CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"

export function StudioSidebarNav() {
  const t = useTranslations("ui")
  const tCommand = useTranslations("command")
  const registry = createNavigationRegistry({
    items: [
      ...defineHomeNavigationItems({
        groupLabel: t("studio"),
        homeDescription: tCommand("homeDescription"),
        homeLabel: t("home"),
      }),
      {
        description: t("billingOverviewDescription"),
        groupId: "home-root",
        groupLabel: t("studio"),
        href: "/settings/billing",
        icon: CreditCard,
        id: "billing",
        label: t("billing"),
        order: 10,
        placements: ["sidebar", "command"],
        keywords: [t("billing"), "plan", "invoice"],
      },
    ],
  })

  return <ShellSidebarNav groups={toShellSidebarNavGroups(registry)} />
}
