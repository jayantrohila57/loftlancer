import { z } from "zod"
import { ACTION_PLACEMENTS } from "../constants/action.placements"
import type {
  ActionItem,
  ActionPlacement,
  ActionRegistry,
  ActionRunHandler,
  CreateActionRegistryInput,
} from "../types/action.types"
import { compareActionItems } from "../utils/action.sort"

const actionPlacementSchema = z.enum(ACTION_PLACEMENTS)

const actionHrefHandlerSchema = z
  .object({
    href: z.string().min(1),
    kind: z.literal("href"),
  })
  .strict()

const actionIntentHandlerSchema = z
  .object({
    intent: z.string().min(1),
    kind: z.literal("intent"),
  })
  .strict()

const actionRunHandlerSchema = z
  .object({
    kind: z.literal("run"),
    run: z.custom<ActionRunHandler["run"]>(),
  })
  .strict()

const actionHandlerSchema = z.discriminatedUnion("kind", [
  actionHrefHandlerSchema,
  actionIntentHandlerSchema,
  actionRunHandlerSchema,
])

const actionItemSchema = z.object({
  activityActionId: z.string().min(1).optional(),
  description: z.string().optional(),
  groupId: z.string().min(1).optional(),
  groupLabel: z.string().min(1).optional(),
  handler: actionHandlerSchema,
  icon: z.custom<ActionItem["icon"]>().optional(),
  id: z.string().min(1),
  keywords: z.array(z.string().min(1)).optional(),
  label: z.string().min(1),
  order: z.number().int().optional(),
  parentId: z.string().min(1).optional(),
  placements: z.array(actionPlacementSchema).min(1),
  selectable: z.boolean().optional(),
})

function assertValidActionItems(items: readonly ActionItem[]): void {
  const parsed = z.array(actionItemSchema).safeParse(items)

  if (!parsed.success) {
    throw new Error(
      `Invalid action items: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`
    )
  }

  const ids = new Set<string>()

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate action item id: ${item.id}`)
    }

    ids.add(item.id)
  }

  const byId = new Map(items.map((item) => [item.id, item]))

  for (const item of items) {
    if (item.parentId === undefined) {
      continue
    }

    const parent = byId.get(item.parentId)
    if (parent === undefined) {
      // Parent may be a navigation item in another registry (shared id at palette merge).
      continue
    }

    if (parent.parentId !== undefined) {
      throw new Error(
        `Action item "${item.id}" may only nest one level below "${item.parentId}"`
      )
    }
  }
}

function itemsByPlacement(
  items: readonly ActionItem[],
  placement: ActionPlacement
): ActionItem[] {
  return [...items]
    .filter((item) => item.placements.includes(placement))
    .sort(compareActionItems)
}

function itemsByGroupId(
  items: readonly ActionItem[],
  groupId: string
): ActionItem[] {
  return [...items]
    .filter((item) => item.groupId === groupId)
    .sort(compareActionItems)
}

export function createActionRegistry(
  input: CreateActionRegistryInput
): ActionRegistry {
  const items = Object.freeze([...input.items]) as readonly ActionItem[]

  assertValidActionItems(items)

  const byId = new Map(items.map((item) => [item.id, item]))

  return {
    items,
    getByGroupId: (groupId) =>
      Object.freeze(itemsByGroupId(items, groupId)) as readonly ActionItem[],
    getById: (id) => byId.get(id),
    getByPlacement: (placement) =>
      Object.freeze(
        itemsByPlacement(items, placement)
      ) as readonly ActionItem[],
  }
}

export function mergeActionItems(
  ...groups: readonly (readonly ActionItem[])[]
): ActionItem[] {
  return groups.flat()
}
