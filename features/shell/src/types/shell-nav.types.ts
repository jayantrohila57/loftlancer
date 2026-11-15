import type { LucideIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

export type ShellNavLinkComponent = ComponentType<{
  readonly children?: ReactNode
  readonly className?: string
  readonly href: string
}>

export type ShellAppRouter = {
  refresh: () => void
  replace: (href: string, options?: unknown) => void
}

export interface ShellNavigationBindings {
  readonly Link: ShellNavLinkComponent
  readonly usePathname: () => string
  readonly useRouter: () => ShellAppRouter
}

export interface ShellSidebarNavSubItem {
  readonly href: string
  readonly icon?: LucideIcon
  readonly label: string
}

export interface ShellSidebarNavItem {
  readonly href: string
  readonly icon: LucideIcon
  readonly label: string
  readonly subItems?: readonly ShellSidebarNavSubItem[]
}

export interface ShellSidebarNavGroup {
  readonly items: readonly ShellSidebarNavItem[]
  readonly label: string
}

export interface ShellSectionTabItem {
  readonly href: string
  readonly label: string
  readonly value: string
}
