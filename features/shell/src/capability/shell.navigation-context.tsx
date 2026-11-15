"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"

import type { ShellNavigationBindings } from "../types/shell-nav.types"

const ShellNavigationContext = createContext<ShellNavigationBindings | null>(
  null
)

export interface ShellNavigationProviderProps extends ShellNavigationBindings {
  readonly children: ReactNode
}

export function ShellNavigationProvider({
  children,
  Link,
  usePathname,
  useRouter,
}: ShellNavigationProviderProps) {
  return (
    <ShellNavigationContext.Provider value={{ Link, usePathname, useRouter }}>
      {children}
    </ShellNavigationContext.Provider>
  )
}

export function useShellNavigation(): ShellNavigationBindings {
  const value = useContext(ShellNavigationContext)
  if (!value) {
    throw new Error(
      "useShellNavigation must be used within ShellNavigationProvider"
    )
  }

  return value
}
