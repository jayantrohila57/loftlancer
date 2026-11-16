"use client"

import { QueryProvider } from "@packages/react-query"
import type { ReactNode } from "react"

/** Public marketing app — session hooks only; no private-app sign-out redirect guard. */
export function WebQueryProvider({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
