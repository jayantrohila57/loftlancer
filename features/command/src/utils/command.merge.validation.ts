import type { ActionRegistry } from "@features/action"
import type { NavigationRegistry } from "@features/navigation"

/** Ensures navigation and action command placements merge without id or nesting conflicts. */
export function assertValidCommandPaletteRegistries(
  navigationRegistry: NavigationRegistry,
  actionRegistry: ActionRegistry
): void {
  const navigationCommandItems = navigationRegistry.getByPlacement("command")
  const actionCommandItems = actionRegistry.getByPlacement("command")

  const navigationIds = new Set(navigationCommandItems.map((item) => item.id))

  for (const action of actionCommandItems) {
    if (navigationIds.has(action.id)) {
      throw new Error(
        `Duplicate command palette id across registries: ${action.id}`
      )
    }
  }

  for (const action of actionCommandItems) {
    if (action.parentId === undefined) {
      continue
    }

    const parentNavigation = navigationRegistry.getById(action.parentId)
    const parentAction = actionRegistry.getById(action.parentId)

    if (parentNavigation === undefined && parentAction === undefined) {
      throw new Error(
        `Action command item "${action.id}" references unknown parentId "${action.parentId}"`
      )
    }

    if (parentAction?.parentId !== undefined) {
      throw new Error(
        `Action command item "${action.id}" may only nest one level below "${action.parentId}"`
      )
    }
  }

  for (const navigation of navigationCommandItems) {
    if (navigation.parentId === undefined) {
      continue
    }

    const parent = navigationRegistry.getById(navigation.parentId)
    if (parent !== undefined && !parent.placements.includes("command")) {
      throw new Error(
        `Navigation command item "${navigation.id}" parent "${navigation.parentId}" is missing command placement`
      )
    }
  }
}
