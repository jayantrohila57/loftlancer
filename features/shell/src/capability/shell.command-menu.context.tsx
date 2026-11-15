"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import type { ShellCommandMenuLabels } from "./shell.command-menu"

export interface ShellCommandMenuContextValue {
  readonly labels: ShellCommandMenuLabels
  readonly openPalette: () => void
  readonly registerTrigger: (element: HTMLElement | null) => void
  readonly setOpen: (open: boolean) => void
}

const ShellCommandMenuContext = createContext<
  ShellCommandMenuContextValue | undefined
>(undefined)

export function ShellCommandMenuProvider({
  children,
  value,
}: {
  readonly children: ReactNode
  readonly value: ShellCommandMenuContextValue
}) {
  return (
    <ShellCommandMenuContext.Provider value={value}>
      {children}
    </ShellCommandMenuContext.Provider>
  )
}

export function useShellCommandMenu():
  | ShellCommandMenuContextValue
  | undefined {
  return useContext(ShellCommandMenuContext)
}
