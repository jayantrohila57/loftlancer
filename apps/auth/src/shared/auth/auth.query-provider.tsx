"use client"

import { AuthPrivateClientIdentityGuard } from "@modules/auth"
import { OrgSessionEffects } from "@modules/org"
import { QueryProvider, ReactQueryDevtools } from "@packages/react-query"
import type { ReactNode } from "react"

export function AuthQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthPrivateClientIdentityGuard>
        <OrgSessionEffects>{children}</OrgSessionEffects>
      </AuthPrivateClientIdentityGuard>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  )
}
