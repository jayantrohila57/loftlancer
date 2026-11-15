import type { ActionItem } from "../types/action.types"

export function compareActionItems(
  left: ActionItem,
  right: ActionItem
): number {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.label.localeCompare(right.label)
}

export function sortActionItems(items: readonly ActionItem[]): ActionItem[] {
  return [...items].sort(compareActionItems)
}
