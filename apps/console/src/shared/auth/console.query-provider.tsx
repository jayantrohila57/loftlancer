"use client"

import { AuthPrivateClientIdentityGuard } from "@modules/auth"
import { QueryProvider } from "@packages/react-query"
import type { ReactNode } from "react"

export function ConsoleQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthPrivateClientIdentityGuard>
        {children}
      </AuthPrivateClientIdentityGuard>
    </QueryProvider>
  )
}
