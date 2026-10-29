"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useSession } from "@/module/auth/auth.auth.actions";

/**
 * Browser Sentry user + `org_id` tag, ids only (#354). Mirrors the server
 * side (`setRequestIdentity`); cleared when there is no session (sign-out).
 */
export function SentryUser() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;
  const orgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)
      ?.activeOrganizationId ?? null;

  useEffect(() => {
    if (isPending) return;
    Sentry.setUser(userId ? { id: userId } : null);
    Sentry.setTag("org_id", orgId ?? undefined);
  }, [isPending, userId, orgId]);

  return null;
}
