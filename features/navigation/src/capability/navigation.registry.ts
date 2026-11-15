import { z } from "zod"
import { NAVIGATION_PLACEMENTS } from "../constants/navigation.placements"
import type {
  CreateNavigationRegistryInput,
  NavigationItem,
  NavigationPlacement,
  NavigationRegistry,
} from "../types/navigation.types"
import { compareNavigationItems } from "../utils/navigation.sort"

const navigationPlacementSchema = z.enum(NAVIGATION_PLACEMENTS)

const navigationItemSchema = z.object({
  description: z.string().optional(),
  groupId: z.string().min(1).optional(),
  groupLabel: z.string().min(1).optional(),
  href: z.string().min(1),
  icon: z.custom<NavigationItem["icon"]>().optional(),
  id: z.string().min(1),
  keywords: z.array(z.string().min(1)).optional(),
  label: z.string().min(1),
  order: z.number().int().optional(),
  parentId: z.string().min(1).optional(),
  placements: z.array(navigationPlacementSchema).min(1),
  tabValue: z.string().min(1).optional(),
})

function assertValidNavigationItems(items: readonly NavigationItem[]): void {
  const parsed = z.array(navigationItemSchema).safeParse(items)

  if (!parsed.success) {
    throw new Error(
      `Invalid navigation items: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`
    )
  }

  const ids = new Set<string>()

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate navigation item id: ${item.id}`)
    }

    ids.add(item.id)
  }

  const byId = new Map(items.map((item) => [item.id, item]))

  for (const item of items) {
    if (item.parentId !== undefined && !ids.has(item.parentId)) {
      throw new Error(
        `Navigation item "${item.id}" references unknown parentId "${item.parentId}"`
      )
    }

    if (item.parentId !== undefined) {
      const parent = byId.get(item.parentId)
      if (parent?.parentId !== undefined) {
        throw new Error(
          `Navigation item "${item.id}" may only nest one level below "${item.parentId}"`
        )
      }
    }
  }

  for (const item of items) {
    if (
      item.placements.includes("tabs") &&
      item.tabValue === undefined &&
      item.parentId === undefined
    ) {
      throw new Error(
        `Navigation item "${item.id}" with placement "tabs" requires tabValue`
      )
    }
  }
}

function itemsByPlacement(
  items: readonly NavigationItem[],
  placement: NavigationPlacement
): NavigationItem[] {
  return [...items]
    .filter((item) => item.placements.includes(placement))
    .sort(compareNavigationItems)
}

export function createNavigationRegistry(
  input: CreateNavigationRegistryInput
): NavigationRegistry {
  const items = Object.freeze([...input.items]) as readonly NavigationItem[]

  assertValidNavigationItems(items)

  const childrenByParent = new Map<string, NavigationItem[]>()

  for (const item of items) {
    if (item.parentId === undefined) continue

    const siblings = childrenByParent.get(item.parentId) ?? []
    siblings.push(item)
    childrenByParent.set(item.parentId, siblings)
  }

  for (const [parentId, siblings] of childrenByParent) {
    childrenByParent.set(parentId, siblings.sort(compareNavigationItems))
  }

  const byId = new Map(items.map((item) => [item.id, item]))

  return {
    items,
    getById: (id) => byId.get(id),
    getByPlacement: (placement) => itemsByPlacement(items, placement),
    getChildren: (parentId) =>
      Object.freeze(
        childrenByParent.get(parentId) ?? []
      ) as readonly NavigationItem[],
  }
}

export function mergeNavigationItems(
  ...groups: readonly (readonly NavigationItem[])[]
): NavigationItem[] {
  return groups.flat()
}
