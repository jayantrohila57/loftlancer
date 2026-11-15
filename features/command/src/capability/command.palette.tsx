"use client"

import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import {
  Command,
  CommandDialog,
  CommandDialogDescription,
  CommandDialogPopup,
  CommandDialogTitle,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandShortcut,
} from "@packages/ui/components/command"
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { cn } from "@packages/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRightIcon, CornerDownLeftIcon } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"
import type {
  CommandPaletteItem,
  CommandPaletteProps,
  CommandPaletteSourceFilter,
} from "../types/command.types"
import {
  countCommandPaletteGroupItems,
  filterCommandPaletteGroupsWithOptions,
  isCommandPaletteItemSelectable,
  normalizeCommandSearchQuery,
} from "../utils/command.merge"

function formatResultsStatus(template: string, count: number): string {
  return template.replace("{count}", String(count))
}

function formatNavigateToHref(template: string, href: string): string {
  return template.replace("{href}", href)
}

const paletteRowAffordanceClassName =
  "text-muted-foreground opacity-80 transition-[color,opacity] group-data-[highlighted]/cmd-item:text-foreground group-data-[highlighted]/cmd-item:opacity-100"

function commandItemHrefPreview(item: CommandPaletteItem): string | undefined {
  if (item.handler.kind === "href") {
    return item.handler.href
  }

  return undefined
}

const commandPaletteItemIconClassName =
  "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground opacity-80 transition-[color,opacity] group-data-[highlighted]/cmd-item:text-foreground group-data-[highlighted]/cmd-item:opacity-100"

function CommandPaletteItemIcon({
  icon: Icon,
  label,
}: {
  readonly icon: LucideIcon | undefined
  readonly label: string
}) {
  if (Icon === undefined) {
    return (
      <span
        aria-hidden="true"
        className={cn(commandPaletteItemIconClassName, "text-xs font-semibold")}
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    <span aria-hidden="true" className={commandPaletteItemIconClassName}>
      <Icon className="size-4" />
    </span>
  )
}

interface PaletteItemRowProps {
  readonly item: CommandPaletteItem
  readonly navigateToHrefLabel: string
  readonly sourceActionLabel: string
  readonly sourceNavigationLabel: string
}

function PaletteItemNavigateHint({
  href,
  navigateToHrefLabel,
}: {
  readonly href: string
  readonly navigateToHrefLabel: string
}) {
  const tooltipLabel = formatNavigateToHref(navigateToHrefLabel, href)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            aria-hidden="true"
            className={cn(
              "hidden size-6 shrink-0 items-center justify-center rounded-md group-hover/cmd-item:flex",
              paletteRowAffordanceClassName
            )}
            tabIndex={-1}
          />
        }
      >
        <ArrowUpRightIcon className="size-3.5" />
      </TooltipTrigger>
      <TooltipPopup side="left">{tooltipLabel}</TooltipPopup>
    </Tooltip>
  )
}

function PaletteItemRow({
  item,
  navigateToHrefLabel,
  sourceActionLabel,
  sourceNavigationLabel,
}: PaletteItemRowProps) {
  const hrefPreview = commandItemHrefPreview(item)
  const sourceLabel =
    item.source === "navigation" ? sourceNavigationLabel : sourceActionLabel
  const selectable = isCommandPaletteItemSelectable(item)

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CommandPaletteItemIcon icon={item.icon} label={item.label} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{item.label}</span>
          {item.description !== undefined ? (
            <span className="block truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>
      </div>
      {selectable ? (
        <span className="ms-auto flex shrink-0 items-center gap-2">
          <Badge
            className="hidden shrink-0 sm:inline-flex"
            size="sm"
            variant="outline"
          >
            {sourceLabel}
          </Badge>
          <span className="flex items-center gap-1">
            {hrefPreview !== undefined ? (
              <PaletteItemNavigateHint
                href={hrefPreview}
                navigateToHrefLabel={navigateToHrefLabel}
              />
            ) : null}
            <CommandShortcut
              className={cn(
                "ms-0 hidden sm:inline-flex",
                paletteRowAffordanceClassName,
                hrefPreview !== undefined ? "group-hover/cmd-item:hidden" : null
              )}
            >
              <CornerDownLeftIcon aria-hidden="true" className="size-3.5" />
            </CommandShortcut>
          </span>
        </span>
      ) : null}
    </>
  )
}

function getNestedSiblingsForParent(
  groupItems: readonly CommandPaletteItem[],
  parentId: string
): readonly CommandPaletteItem[] {
  return groupItems.filter(
    (entry) =>
      entry.parentId === parentId && isCommandPaletteItemSelectable(entry)
  )
}

function getNestedTreePlacement(
  groupItems: readonly CommandPaletteItem[],
  item: CommandPaletteItem
): { readonly isFirst: boolean; readonly isLast: boolean } | undefined {
  if (item.parentId === undefined) {
    return undefined
  }

  const siblings = getNestedSiblingsForParent(groupItems, item.parentId)
  const index = siblings.findIndex((sibling) => sibling.id === item.id)
  if (index === -1) {
    return undefined
  }

  return {
    isFirst: index === 0,
    isLast: index === siblings.length - 1,
  }
}

function groupItemHasNestedChildren(
  groupItems: readonly CommandPaletteItem[],
  parentId: string,
  fromIndex: number
): boolean {
  for (let index = fromIndex + 1; index < groupItems.length; index += 1) {
    const next = groupItems[index]
    if (next === undefined) {
      break
    }

    if (next.parentId === parentId) {
      return true
    }

    if (next.parentId === undefined) {
      break
    }
  }

  return false
}

const paletteParentTreeStemClassName =
  "relative after:pointer-events-none after:absolute after:top-1/2 after:bottom-0 after:start-[1.75rem] after:z-0 after:w-px after:bg-border/60"

function nestedCommandItemTreeClassName(placement: {
  readonly isFirst: boolean
  readonly isLast: boolean
}): string {
  let verticalExtent: string
  if (placement.isFirst && placement.isLast) {
    verticalExtent = "before:h-[calc(50%+0.75rem)] before:-top-3"
  } else if (placement.isFirst) {
    verticalExtent = "before:-top-3 before:bottom-0"
  } else if (placement.isLast) {
    verticalExtent = "before:top-0 before:h-1/2"
  } else {
    verticalExtent = "before:inset-y-0"
  }

  return cn(
    "group/cmd-item relative ms-3 gap-3 rounded-md py-2 ps-7 pe-2.5",
    "before:pointer-events-none before:absolute before:start-4 before:z-0 before:w-px before:bg-border/60",
    verticalExtent,
    "after:pointer-events-none after:absolute after:start-4 after:top-1/2 after:z-0 after:h-px after:w-3 after:bg-border/60"
  )
}

function PaletteNestedParentHeader({
  item,
  showTreeStem,
}: {
  readonly item: CommandPaletteItem
  readonly showTreeStem: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-muted-foreground",
        showTreeStem ? paletteParentTreeStemClassName : undefined
      )}
      role="presentation"
    >
      <CommandPaletteItemIcon icon={item.icon} label={item.label} />
      <span className="truncate text-xs font-semibold tracking-wide uppercase">
        {item.label}
      </span>
    </div>
  )
}

interface CommandPaletteFilterBarProps {
  readonly activeFilter: CommandPaletteSourceFilter
  readonly filterActionsLabel: string
  readonly filterAllLabel: string
  readonly filterNavigationLabel: string
  readonly listId: string
  readonly onFilterChange: (filter: CommandPaletteSourceFilter) => void
}

function CommandPaletteFilterBar({
  activeFilter,
  filterActionsLabel,
  filterAllLabel,
  filterNavigationLabel,
  listId,
  onFilterChange,
}: CommandPaletteFilterBarProps) {
  const filters: {
    readonly id: CommandPaletteSourceFilter
    readonly label: string
  }[] = [
    { id: "all", label: filterAllLabel },
    { id: "navigation", label: filterNavigationLabel },
    { id: "action", label: filterActionsLabel },
  ]

  return (
    <div
      aria-controls={listId}
      className="flex flex-wrap gap-1.5 px-2.5 pb-2"
      role="tablist"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id

        return (
          <Button
            aria-selected={isActive}
            className="h-7 rounded-full px-2.5 text-xs before:rounded-full"
            key={filter.id}
            onClick={() => {
              onFilterChange(filter.id)
            }}
            role="tab"
            size="sm"
            type="button"
            variant={isActive ? "secondary" : "outline"}
          >
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}

export function CommandPalette({
  dialogDescriptionLabel,
  dialogTitleLabel,
  emptyLabel,
  filterActionsLabel,
  filterAllLabel,
  filterNavigationLabel,
  footerCloseKeyLabel,
  footerCloseLabel,
  footerInstructionsLabel,
  footerNavigateDownKeyLabel,
  footerNavigateUpKeyLabel,
  footerOpenShortcutLabel,
  footerSelectLabel,
  groups,
  navigateHintLabel,
  navigateToHrefLabel,
  onOpenChange,
  onSelect,
  open,
  placeholder,
  resolveFinalFocus,
  resultsStatusLabel,
  searchLabel,
  sourceActionLabel,
  sourceNavigationLabel,
}: CommandPaletteProps) {
  const [inputValue, setInputValue] = useState("")
  const [sourceFilter, setSourceFilter] =
    useState<CommandPaletteSourceFilter>("all")
  const listId = useId()
  const hasSearchQuery = normalizeCommandSearchQuery(inputValue).length > 0

  useEffect(() => {
    if (!open) {
      setInputValue("")
      setSourceFilter("all")
    }
  }, [open])

  const filteredGroups = useMemo(
    () =>
      filterCommandPaletteGroupsWithOptions(groups, inputValue, sourceFilter),
    [groups, inputValue, sourceFilter]
  )

  const visibleItemCount = useMemo(
    () => countCommandPaletteGroupItems(filteredGroups),
    [filteredGroups]
  )

  const showEmptyState = visibleItemCount === 0
  const resultsStatus = formatResultsStatus(
    resultsStatusLabel,
    visibleItemCount
  )

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandDialogPopup
        className="overflow-hidden p-0"
        finalFocus={resolveFinalFocus}
      >
        <CommandDialogTitle className="sr-only">
          {dialogTitleLabel}
        </CommandDialogTitle>
        <CommandDialogDescription className="sr-only">
          {dialogDescriptionLabel}
        </CommandDialogDescription>
        <Command>
          <CommandInput
            aria-controls={listId}
            aria-describedby={hasSearchQuery ? `${listId}-status` : undefined}
            aria-label={searchLabel}
            onChange={(event) => {
              setInputValue(event.currentTarget.value)
            }}
            placeholder={placeholder}
            value={inputValue}
          />
          <CommandPaletteFilterBar
            activeFilter={sourceFilter}
            filterActionsLabel={filterActionsLabel}
            filterAllLabel={filterAllLabel}
            filterNavigationLabel={filterNavigationLabel}
            listId={listId}
            onFilterChange={setSourceFilter}
          />
          <CommandPanel className="border-0 border-t bg-transparent shadow-none [clip-path:none] before:hidden">
            <CommandList
              aria-label={dialogTitleLabel}
              className="max-h-[min(26rem,52vh)] not-empty:px-1.5"
              id={listId}
            >
              {showEmptyState ? (
                <div
                  className="px-2.5 py-10 text-center text-sm text-muted-foreground"
                  role="status"
                >
                  {emptyLabel}
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <CommandGroup key={group.id}>
                    <CommandGroupLabel className="px-2.5">
                      {group.label}
                    </CommandGroupLabel>
                    {group.items.map((item, itemIndex) => {
                      const nested = item.parentId !== undefined
                      const selectable = isCommandPaletteItemSelectable(item)
                      const treePlacement = nested
                        ? getNestedTreePlacement(group.items, item)
                        : undefined
                      const showParentTreeStem = groupItemHasNestedChildren(
                        group.items,
                        item.id,
                        itemIndex
                      )

                      if (!selectable) {
                        return (
                          <PaletteNestedParentHeader
                            item={item}
                            key={item.id}
                            showTreeStem={showParentTreeStem}
                          />
                        )
                      }

                      return (
                        <CommandItem
                          className={
                            nested && treePlacement !== undefined
                              ? nestedCommandItemTreeClassName(treePlacement)
                              : cn(
                                  "group/cmd-item gap-3 rounded-md px-2.5 py-2",
                                  showParentTreeStem
                                    ? paletteParentTreeStemClassName
                                    : undefined
                                )
                          }
                          key={item.id}
                          onClick={() => {
                            onSelect(item)
                            onOpenChange(false)
                          }}
                          value={item.id}
                        >
                          <PaletteItemRow
                            item={item}
                            navigateToHrefLabel={navigateToHrefLabel}
                            sourceActionLabel={sourceActionLabel}
                            sourceNavigationLabel={sourceNavigationLabel}
                          />
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))
              )}
            </CommandList>
            {hasSearchQuery ? (
              <p aria-live="polite" className="sr-only" id={`${listId}-status`}>
                {resultsStatus}
              </p>
            ) : null}
          </CommandPanel>
          <CommandFooter className="flex-col items-stretch gap-2 px-2.5 py-2 sm:flex-row sm:items-center">
            <p className="min-w-0 text-muted-foreground/90">
              {footerInstructionsLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:justify-end sm:gap-3">
              <span className="inline-flex items-center gap-1.5">
                <CommandShortcut>{footerNavigateUpKeyLabel}</CommandShortcut>
                <CommandShortcut>{footerNavigateDownKeyLabel}</CommandShortcut>
                <span>{navigateHintLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CommandShortcut>
                  <CornerDownLeftIcon
                    aria-hidden="true"
                    className="size-3 opacity-80"
                  />
                </CommandShortcut>
                <span>{footerSelectLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CommandShortcut>{footerCloseKeyLabel}</CommandShortcut>
                <span>{footerCloseLabel}</span>
              </span>
              <CommandShortcut className="hidden sm:inline-flex">
                {footerOpenShortcutLabel}
              </CommandShortcut>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  )
}
