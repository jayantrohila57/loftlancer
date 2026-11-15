import type { NavigationItem } from "../types/navigation.types"

export function compareNavigationItems(
  left: NavigationItem,
  right: NavigationItem
): number {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.label.localeCompare(right.label)
}

export function sortNavigationItems(
  items: readonly NavigationItem[]
): NavigationItem[] {
  return [...items].sort(compareNavigationItems)
}
