import type {
  NavigationCommandItem,
  NavigationItem,
  NavigationRegistry,
  NavigationSectionTabItem,
  NavigationSidebarNavGroup,
  NavigationSidebarNavItem,
  NavigationSidebarNavSubItem,
} from "../types/navigation.types"
import { sortNavigationItems } from "./navigation.sort"

const DEFAULT_GROUP_ID = "default"

function groupKey(item: NavigationItem): string {
  return item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID
}

function groupLabelFor(
  groupId: string,
  items: readonly NavigationItem[]
): string {
  const match = items.find(
    (item) => (item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID) === groupId
  )

  return match?.groupLabel ?? match?.groupId ?? groupId
}

function defaultIcon(
  item: NavigationItem
): NonNullable<NavigationItem["icon"]> {
  if (item.icon === undefined) {
    throw new Error(
      `Navigation item "${item.id}" is missing icon required for sidebar placement`
    )
  }

  return item.icon
}

function toSidebarSubItem(child: NavigationItem): NavigationSidebarNavSubItem {
  return {
    href: child.href,
    icon: child.icon,
    label: child.label,
  }
}

function toSidebarNavItem(
  item: NavigationItem,
  children: readonly NavigationItem[]
): NavigationSidebarNavItem {
  const subItems =
    children.length > 0
      ? children.map((child) => toSidebarSubItem(child))
      : undefined

  return {
    href: item.href,
    icon: defaultIcon(item),
    label: item.label,
    subItems,
  }
}

export interface ToShellSidebarNavGroupsOptions {
  readonly placement?: "sidebar"
}

/** Build grouped sidebar nav from registry entries with placement `sidebar`. */
export function toShellSidebarNavGroups(
  registry: NavigationRegistry,
  _options?: ToShellSidebarNavGroupsOptions
): readonly NavigationSidebarNavGroup[] {
  const sidebarItems = registry.getByPlacement("sidebar")
  const roots = sidebarItems.filter((item) => item.parentId === undefined)

  const rootsByGroup = new Map<string, NavigationItem[]>()

  for (const root of roots) {
    const key = groupKey(root)
    const bucket = rootsByGroup.get(key) ?? []
    bucket.push(root)
    rootsByGroup.set(key, bucket)
  }

  return [...rootsByGroup.entries()].map(([groupId, groupRoots]) => ({
    label: groupLabelFor(groupId, sidebarItems),
    items: sortNavigationItems(groupRoots).map((root) =>
      toSidebarNavItem(root, registry.getChildren(root.id))
    ),
  }))
}

export interface ToShellSectionTabsOptions {
  readonly parentId?: string
}

/** Map tab-placement items to section subnav tabs (optionally under one parent). */
export function toShellSectionTabs(
  registry: NavigationRegistry,
  options?: ToShellSectionTabsOptions
): readonly NavigationSectionTabItem[] {
  return registry
    .getByPlacement("tabs")
    .filter((item) =>
      options?.parentId === undefined
        ? true
        : item.parentId === options.parentId
    )
    .map((item) => ({
      href: item.href,
      label: item.label,
      value: item.tabValue ?? item.id,
    }))
}

function commandKeywords(item: NavigationItem): readonly string[] {
  const base = item.keywords ?? []

  if (base.includes(item.label)) {
    return base
  }

  return [item.label, ...base]
}

/** Flat command-palette entries from placement `command`. */
export function toNavigationCommandItems(
  registry: NavigationRegistry
): readonly NavigationCommandItem[] {
  return registry.getByPlacement("command").map((item) => ({
    description: item.description,
    groupLabel: item.groupLabel ?? item.groupId,
    href: item.href,
    id: item.id,
    keywords: commandKeywords(item),
    label: item.label,
    parentId: item.parentId,
  }))
}

/** Header menu links from placement `header`. */
export function toNavigationHeaderItems(
  registry: NavigationRegistry
): readonly NavigationItem[] {
  return registry.getByPlacement("header")
}
