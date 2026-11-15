"use client"

import type { ActionRegistry } from "@features/action"
import type { CommandPaletteItem } from "@features/command"
import {
  CommandPalette,
  executeCommandPaletteItem,
  mergeCommandPaletteFromRegistries,
} from "@features/command"
import type { NavigationRegistry } from "@features/navigation"
import { useOverlayReturnFocus } from "@packages/ui/hooks/use-overlay-return-focus"
import { shouldIgnoreGlobalKeyboardShortcut } from "@packages/ui/lib/keyboard-shortcut-target"
import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ShellCommandMenuProvider } from "./shell.command-menu.context"

export interface ShellCommandMenuLabels {
  readonly dialogDescription: string
  readonly dialogTitle: string
  readonly empty: string
  readonly filterActions: string
  readonly filterAll: string
  readonly filterNavigation: string
  readonly footerClose: string
  readonly footerCloseKey: string
  readonly footerInstructions: string
  readonly footerNavigate: string
  readonly footerNavigateDownKey: string
  readonly footerNavigateUpKey: string
  readonly footerOpenShortcut: string
  readonly footerSelect: string
  readonly navigateToHref: string
  readonly placeholder: string
  readonly resultsStatus: string
  readonly searchLabel: string
  readonly sourceAction: string
  readonly sourceNavigation: string
  readonly triggerLabel: string
}

export interface ShellCommandMenuProps {
  readonly actionRegistry: ActionRegistry
  readonly children?: ReactNode
  readonly labels: ShellCommandMenuLabels
  readonly navigate: (href: string) => void
  readonly navigationRegistry: NavigationRegistry
  readonly onCommandRunError?: (
    error: unknown,
    item: CommandPaletteItem
  ) => void
  readonly onIntent?: (intent: string) => void
}

export function ShellCommandMenu({
  actionRegistry,
  children,
  labels,
  navigate,
  navigationRegistry,
  onCommandRunError,
  onIntent,
}: ShellCommandMenuProps) {
  const [open, setOpen] = useState(false)
  const { captureReturnFocus, fallbackRef, resolveFinalFocus } =
    useOverlayReturnFocus()

  const groups = useMemo(
    () =>
      mergeCommandPaletteFromRegistries({
        actionRegistry,
        navigationRegistry,
      }),
    [actionRegistry, navigationRegistry]
  )

  const onSelect = useCallback(
    (item: CommandPaletteItem) => {
      void executeCommandPaletteItem(item, {
        navigate,
        onIntent,
        ...(onCommandRunError === undefined
          ? {}
          : {
              onRunError: (error) => {
                onCommandRunError(error, item)
              },
            }),
      })
    },
    [navigate, onCommandRunError, onIntent]
  )

  const openPalette = useCallback(() => {
    captureReturnFocus()
    setOpen(true)
  }, [captureReturnFocus])

  const registerTrigger = useCallback(
    (element: HTMLElement | null) => {
      fallbackRef.current = element
    },
    [fallbackRef]
  )

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        captureReturnFocus()
      }
      setOpen(nextOpen)
    },
    [captureReturnFocus]
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreGlobalKeyboardShortcut(event)) {
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => {
          if (!current) {
            captureReturnFocus()
          }
          return !current
        })
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [captureReturnFocus])

  const contextValue = useMemo(
    () => ({
      labels,
      openPalette,
      registerTrigger,
      setOpen: onOpenChange,
    }),
    [labels, onOpenChange, openPalette, registerTrigger]
  )

  return (
    <ShellCommandMenuProvider value={contextValue}>
      {children}
      <CommandPalette
        dialogDescriptionLabel={labels.dialogDescription}
        dialogTitleLabel={labels.dialogTitle}
        emptyLabel={labels.empty}
        filterActionsLabel={labels.filterActions}
        filterAllLabel={labels.filterAll}
        filterNavigationLabel={labels.filterNavigation}
        footerCloseKeyLabel={labels.footerCloseKey}
        footerCloseLabel={labels.footerClose}
        footerInstructionsLabel={labels.footerInstructions}
        footerNavigateDownKeyLabel={labels.footerNavigateDownKey}
        footerNavigateUpKeyLabel={labels.footerNavigateUpKey}
        footerOpenShortcutLabel={labels.footerOpenShortcut}
        footerSelectLabel={labels.footerSelect}
        groups={groups}
        navigateHintLabel={labels.footerNavigate}
        navigateToHrefLabel={labels.navigateToHref}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
        open={open}
        placeholder={labels.placeholder}
        resolveFinalFocus={resolveFinalFocus}
        resultsStatusLabel={labels.resultsStatus}
        searchLabel={labels.searchLabel}
        sourceActionLabel={labels.sourceAction}
        sourceNavigationLabel={labels.sourceNavigation}
      />
    </ShellCommandMenuProvider>
  )
}
