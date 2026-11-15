"use client"

import {
  createNavigationRegistry,
  defineHomeNavigationItems,
  toShellSidebarNavGroups,
} from "@features/navigation"
import { ShellSidebarNav } from "./shell-sidebar-nav"

export interface ShellHomeSidebarNavProps {
  readonly homeDescription?: string
  readonly homeLabel?: string
  readonly label: string
}

export function ShellHomeSidebarNav({
  homeDescription,
  homeLabel,
  label,
}: ShellHomeSidebarNavProps) {
  const registry = createNavigationRegistry({
    items: defineHomeNavigationItems({
      groupLabel: label,
      homeDescription,
      homeLabel,
    }),
  })

  return <ShellSidebarNav groups={toShellSidebarNavGroups(registry)} />
}
