"use client";

import { Spinner } from "@loftlancer/ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { isOnboardingRoute } from "@/lib/is-onboarding-route";
import { isOrganizationOptionalRoute } from "@/lib/is-organization-optional-route";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

import { routes } from "@/utils/navigation";

/**
 * `initialReady` comes from the server session (an active org is set), so the
 * page renders during SSR. Without it the server HTML is only a spinner, and a
 * child `notFound()` can't set a 404 status (#306).
 */
export function OrgOnboardingGate({
  children,
  initialReady = false,
}: {
  children: React.ReactNode;
  initialReady?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = useSession();
  const [ready, setReady] = useState(
    initialReady || !isOrganizationsEnabledOnClient(),
  );

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      return;
    }

    if (isOnboardingRoute(pathname, routes.onboarding())) {
      setReady(true);
      return;
    }

    if (sessionPending) {
      return;
    }

    const activeId = (
      session?.session as { activeOrganizationId?: string | null }
    )?.activeOrganizationId;

    if (activeId) {
      setReady(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const list = await authClient.organization.list();
        const orgs = list.data ?? [];

        if (orgs.length === 0) {
          if (isOrganizationOptionalRoute(pathname)) {
            setReady(true);
            return;
          }
          router.replace(routes.onboarding());
          return;
        }

        const firstId = (orgs[0] as { id?: string })?.id;
        if (firstId) {
          try {
            await authClient.organization.setActive({
              organizationId: firstId,
            });
          } catch {
            // ActiveOrganizationProvider bootstrap will retry.
          }
        }

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, session, sessionPending]);

  if (!ready) {
    return (
      <div
        className="flex min-h-48 flex-1 items-center justify-center py-12"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return children;
}
