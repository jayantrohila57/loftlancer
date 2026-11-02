"use client";

import { useAnalyticsConsent } from "@loftlancer/ui/patterns/analytics-consent";
import { useEffect, useRef } from "react";
import {
  identifyUser,
  loadPostHog,
  resetOrganizationGroup,
  resetPostHog,
  setOrganizationGroup,
} from "@/lib/posthog";
import { useSession } from "@/module/auth/auth.auth.actions";

/**
 * PostHog identify + organization group, ids only (#353). Mirrors
 * `SentryUser`; runs only after analytics consent, and resets PostHog when
 * the session ends or a different user signs in.
 */
export function PostHogUser() {
  const [consent] = useAnalyticsConsent();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;
  const orgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)
      ?.activeOrganizationId ?? null;
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending || consent !== "granted") return;
    loadPostHog();
    const previous = identifiedRef.current;
    if (previous && previous !== userId) resetPostHog();
    identifiedRef.current = userId;
    if (!userId) return;
    identifyUser(userId);
    if (orgId) setOrganizationGroup(orgId);
    else resetOrganizationGroup();
  }, [consent, isPending, userId, orgId]);

  return null;
}
