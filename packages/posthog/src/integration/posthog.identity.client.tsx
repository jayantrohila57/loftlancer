"use client"

import { useEffect, useRef } from "react"

import type { PostHogConsent } from "../types/posthog.types"
import {
  identifyUser,
  loadPostHog,
  resetOrganizationGroup,
  resetPostHog,
  setOrganizationGroup,
} from "./posthog.integration"

export type PostHogIdentityProps = {
  readonly consent: PostHogConsent
  readonly isSessionPending: boolean
  readonly orgId: string | null
  readonly userId: string | null
}

/**
 * Identify by user id only (no email or name) and attach the active organization
 * group. Resets when the session ends or the signed-in user changes.
 */
export function PostHogIdentity({
  consent,
  isSessionPending,
  orgId,
  userId,
}: PostHogIdentityProps) {
  const identifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (isSessionPending || consent !== "granted") return
    loadPostHog()
    const previous = identifiedRef.current
    if (previous && previous !== userId) resetPostHog()
    identifiedRef.current = userId
    if (!userId) return
    identifyUser(userId)
    if (orgId) setOrganizationGroup(orgId)
    else resetOrganizationGroup()
  }, [consent, isSessionPending, orgId, userId])

  return null
}
