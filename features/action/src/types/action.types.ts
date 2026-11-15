import type { LucideIcon } from "lucide-react"
import type { ACTION_PLACEMENTS } from "../constants/action.placements"

export type ActionPlacement = (typeof ACTION_PLACEMENTS)[number]

export type ActionHrefHandler = {
  readonly href: string
  readonly kind: "href"
}

export type ActionIntentHandler = {
  readonly intent: string
  readonly kind: "intent"
}

export type ActionRunHandler = {
  readonly kind: "run"
  readonly run: () => void | Promise<void>
}

export type ActionHandler =
  | ActionHrefHandler
  | ActionIntentHandler
  | ActionRunHandler

/** Declarative action registered once, queried by placement and group. */
export interface ActionItem {
  readonly activityActionId?: string
  readonly description?: string
  readonly groupId?: string
  readonly groupLabel?: string
  readonly handler: ActionHandler
  readonly icon?: LucideIcon
  readonly id: string
  readonly keywords?: readonly string[]
  readonly label: string
  readonly order?: number
  /** Nests under another action or navigation item id (one level only). */
  readonly parentId?: string
  readonly placements: readonly ActionPlacement[]
  /** When false, palette shows a non-selectable group header (handler ignored). */
  readonly selectable?: boolean
}

export interface CreateActionRegistryInput {
  readonly items: readonly ActionItem[]
}

export interface ActionRegistry {
  getByGroupId: (groupId: string) => readonly ActionItem[]
  getById: (id: string) => ActionItem | undefined
  getByPlacement: (placement: ActionPlacement) => readonly ActionItem[]
  readonly items: readonly ActionItem[]
}

export interface ActionCommandItem {
  readonly description?: string
  readonly groupLabel?: string
  readonly handler: ActionHandler
  readonly id: string
  readonly keywords: readonly string[]
  readonly label: string
  readonly parentId?: string
  readonly selectable?: boolean
}

export interface ActionToolbarItem {
  readonly handler: ActionHandler
  readonly icon?: LucideIcon
  readonly id: string
  readonly label: string
}

export interface ActionMenuItem {
  readonly description?: string
  readonly groupLabel?: string
  readonly handler: ActionHandler
  readonly icon?: LucideIcon
  readonly id: string
  readonly label: string
}
