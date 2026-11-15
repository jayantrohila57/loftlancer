"use client"

import { authClient } from "@packages/better-auth/client"
import { SentryIdentity } from "@packages/sentry/identity"

export function ConsoleSentry() {
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user.id ?? null

  return <SentryIdentity isSessionPending={isPending} userId={userId} />
}
