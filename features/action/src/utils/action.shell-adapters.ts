import type {
  ActionCommandItem,
  ActionItem,
  ActionMenuItem,
  ActionRegistry,
  ActionToolbarItem,
} from "../types/action.types"

const DEFAULT_GROUP_ID = "default"

function groupKey(item: ActionItem): string {
  return item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID
}

function groupLabelFor(
  groupId: string,
  items: readonly ActionItem[]
): string | undefined {
  const match = items.find(
    (item) => (item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID) === groupId
  )

  return match?.groupLabel ?? match?.groupId
}

function commandKeywords(item: ActionItem): readonly string[] {
  const base = item.keywords ?? []

  if (base.includes(item.label)) {
    return base
  }

  return [item.label, ...base]
}

/** Flat command-palette entries from placement `command`. */
export function toActionCommandItems(
  registry: ActionRegistry
): readonly ActionCommandItem[] {
  return registry.getByPlacement("command").map((item) => ({
    description: item.description,
    groupLabel: groupLabelFor(
      groupKey(item),
      registry.getByPlacement("command")
    ),
    handler: item.handler,
    id: item.id,
    keywords: commandKeywords(item),
    label: item.label,
    parentId: item.parentId,
    selectable: item.selectable,
  }))
}

/** Toolbar buttons from placement `toolbar`. */
export function toActionToolbarItems(
  registry: ActionRegistry
): readonly ActionToolbarItem[] {
  return registry.getByPlacement("toolbar").map((item) => ({
    handler: item.handler,
    icon: item.icon,
    id: item.id,
    label: item.label,
  }))
}

/** Menu entries from placement `menu`. */
export function toActionMenuItems(
  registry: ActionRegistry
): readonly ActionMenuItem[] {
  return registry.getByPlacement("menu").map((item) => ({
    description: item.description,
    groupLabel: groupLabelFor(groupKey(item), registry.getByPlacement("menu")),
    handler: item.handler,
    icon: item.icon,
    id: item.id,
    label: item.label,
  }))
}
