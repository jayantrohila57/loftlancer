"use client"

import { AutumnProvider } from "autumn-js/react"
import type { ReactNode } from "react"

type AuthAutumnProviderProps = {
  readonly children: ReactNode
}

export function AuthAutumnProvider({ children }: AuthAutumnProviderProps) {
  return <AutumnProvider useBetterAuth>{children}</AutumnProvider>
}
