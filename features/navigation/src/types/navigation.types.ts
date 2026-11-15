import type { LucideIcon } from "lucide-react"
import type { NAVIGATION_PLACEMENTS } from "../constants/navigation.placements"

export type NavigationPlacement = (typeof NAVIGATION_PLACEMENTS)[number]

/** Declarative nav entry registered once, queried by placement and context. */
export interface NavigationItem {
  readonly description?: string
  readonly groupId?: string
  readonly groupLabel?: string
  readonly href: string
  readonly icon?: LucideIcon
  readonly id: string
  readonly keywords?: readonly string[]
  readonly label: string
  readonly order?: number
  readonly parentId?: string
  readonly placements: readonly NavigationPlacement[]
  readonly tabValue?: string
}

export interface CreateNavigationRegistryInput {
  readonly items: readonly NavigationItem[]
}

export interface NavigationRegistry {
  getById: (id: string) => NavigationItem | undefined
  getByPlacement: (placement: NavigationPlacement) => readonly NavigationItem[]
  getChildren: (parentId: string) => readonly NavigationItem[]
  readonly items: readonly NavigationItem[]
}

export interface NavigationCommandItem {
  readonly description?: string
  readonly groupLabel?: string
  readonly href: string
  readonly id: string
  readonly keywords: readonly string[]
  readonly label: string
  readonly parentId?: string
}

export interface DefineHomeNavigationItemsInput {
  readonly groupLabel: string
  readonly homeDescription?: string
  readonly homeHref?: string
  readonly homeLabel?: string
}

/** Sidebar shapes aligned with `@features/shell` `ShellSidebarNav*` types. */
export interface NavigationSidebarNavSubItem {
  readonly href: string
  readonly icon?: LucideIcon
  readonly label: string
}

export interface NavigationSidebarNavItem {
  readonly href: string
  readonly icon: LucideIcon
  readonly label: string
  readonly subItems?: readonly NavigationSidebarNavSubItem[]
}

export interface NavigationSidebarNavGroup {
  readonly items: readonly NavigationSidebarNavItem[]
  readonly label: string
}

export interface NavigationSectionTabItem {
  readonly href: string
  readonly label: string
  readonly value: string
}
