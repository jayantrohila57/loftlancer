"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect, useRef } from "react"

import type { RequestIdentity } from "../types/sentry.types"

export type SentryIdentityProps = RequestIdentity & {
  readonly isSessionPending?: boolean
}

/**
 * Sync Sentry user id and org tag from the signed-in session. Ids only — never
 * email or display name.
 */
export function SentryIdentity({
  isSessionPending = false,
  orgId,
  userId,
}: SentryIdentityProps) {
  const previousUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (isSessionPending) return
    const previous = previousUserRef.current
    if (previous && previous !== userId) {
      Sentry.setUser(null)
    }
    previousUserRef.current = userId ?? null
    if (userId) {
      Sentry.setUser({ id: userId })
      Sentry.setTag("org_id", orgId ?? undefined)
    } else {
      Sentry.setUser(null)
    }
  }, [isSessionPending, orgId, userId])

  return null
}
