"use client"

import { AuthPrivateClientIdentityGuard } from "@modules/auth"
import { OrgSessionEffects } from "@modules/org"
import { QueryProvider } from "@packages/react-query"
import type { ReactNode } from "react"

export function StudioQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthPrivateClientIdentityGuard>
        <OrgSessionEffects>{children}</OrgSessionEffects>
      </AuthPrivateClientIdentityGuard>
    </QueryProvider>
  )
}
