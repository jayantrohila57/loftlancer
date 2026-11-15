import "server-only"

import type { ReactNode } from "react"

import { requireAccountSession } from "@/shared/auth/auth.session"
import type { LangRouteParams } from "@/shared/types/auth.app.types"

export async function AuthAccountSessionGate({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: Promise<LangRouteParams>
}) {
  await requireAccountSession(params)
  return children
}
