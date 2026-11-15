import type { ActionHandler } from "@features/action"
import type { OverlayFinalFocus } from "@packages/ui/hooks/use-overlay-return-focus"
import type { LucideIcon } from "lucide-react"

export type CommandPaletteItemSource = "action" | "navigation"

export type CommandPaletteSourceFilter = "all" | CommandPaletteItemSource

export type CommandPaletteHandler = ActionHandler

export interface CommandPaletteItem {
  readonly description?: string
  readonly groupId?: string
  readonly groupLabel?: string
  readonly handler: CommandPaletteHandler
  readonly icon?: LucideIcon
  readonly id: string
  readonly keywords: readonly string[]
  readonly label: string
  /** When set, item renders indented one level under the parent row (same group). */
  readonly parentId?: string
  readonly selectable?: boolean
  readonly source: CommandPaletteItemSource
}

export interface CommandPaletteGroup {
  readonly id: string
  readonly items: readonly CommandPaletteItem[]
  readonly label: string
}

export interface MergeCommandPaletteFromRegistriesInput {
  readonly actionRegistry: import("@features/action").ActionRegistry
  readonly navigationRegistry: import("@features/navigation").NavigationRegistry
}

export interface CommandPaletteListItem {
  readonly item: CommandPaletteItem
  readonly label: string
  readonly value: string
}

export interface CommandPaletteAutocompleteGroup {
  readonly items: readonly CommandPaletteListItem[]
  readonly label: string
  readonly value: string
}

export interface CommandPaletteProps {
  readonly dialogDescriptionLabel: string
  readonly dialogTitleLabel: string
  readonly emptyLabel: string
  readonly filterActionsLabel: string
  readonly filterAllLabel: string
  readonly filterNavigationLabel: string
  readonly footerCloseKeyLabel: string
  readonly footerCloseLabel: string
  readonly footerInstructionsLabel: string
  readonly footerNavigateDownKeyLabel: string
  readonly footerNavigateUpKeyLabel: string
  readonly footerOpenShortcutLabel: string
  readonly footerSelectLabel: string
  readonly groups: readonly CommandPaletteGroup[]
  readonly navigateHintLabel: string
  /** Template with `{href}` placeholder for navigation row tooltips. */
  readonly navigateToHrefLabel: string
  readonly onOpenChange: (open: boolean) => void
  readonly onSelect: (item: CommandPaletteItem) => void
  readonly open: boolean
  readonly resolveFinalFocus?: OverlayFinalFocus
  readonly placeholder: string
  readonly resultsStatusLabel: string
  readonly searchLabel: string
  readonly sourceActionLabel: string
  readonly sourceNavigationLabel: string
}
