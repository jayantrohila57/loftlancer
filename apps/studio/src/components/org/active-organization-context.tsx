"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { shouldBootstrapSessionActiveOrganization } from "@/lib/org-session-bootstrap";
import { pathAfterOrganizationSwitch } from "@/lib/org-switch-redirect";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { toast } from "@/lib/toast";
import { useSession } from "@/module/auth/auth.auth.actions";
import { trpc } from "@/utils/trpc";

export type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  role?: string;
  logo?: string | null;
  metadata?: string | Record<string, unknown> | null;
  archivedAt?: Date | string | null;
};

type ActiveOrganizationContextValue = {
  enabled: boolean;
  orgs: OrgListItem[];
  activeOrganizationId: string | null;
  loading: boolean;
  isSwitching: boolean;
  initialLoadDone: boolean;
  refreshOrganizations: (options?: {
    activeOrganizationId?: string | null;
  }) => Promise<void>;
  setActiveOrganization: (organizationId: string) => Promise<void>;
  afterOrganizationCreated: (organizationId: string) => Promise<void>;
};

const ActiveOrganizationContext =
  createContext<ActiveOrganizationContextValue | null>(null);

function readSessionActiveOrganizationId(
  session: ReturnType<typeof useSession>["data"],
): string | null {
  return (
    (session?.session as { activeOrganizationId?: string | null })
      ?.activeOrganizationId ?? null
  );
}

export function ActiveOrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const enabled = isOrganizationsEnabledOnClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  // The URL org is the source of truth inside /[org]/… (#313); the session's
  // active org (synced to the last URL org by proxy.ts) covers pre-org pages.
  const params = useParams<{ org?: string }>();
  const urlOrgSlug = typeof params?.org === "string" ? params.org : null;
  const urlOrgSlugRef = useRef(urlOrgSlug);
  useEffect(() => {
    urlOrgSlugRef.current = urlOrgSlug;
  }, [urlOrgSlug]);
  const {
    data: session,
    isPending: sessionPending,
    refetch: refetchSession,
  } = useSession();
  const sessionActiveOrganizationId = readSessionActiveOrganizationId(session);

  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(enabled);
  const [isSwitching, setIsSwitching] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(!enabled);
  const initialLoadStarted = useRef(false);

  useEffect(() => {
    if (!enabled || sessionPending || isSwitching) {
      return;
    }
    // Inside /[org]/… the URL org wins (effect below); never let a stale
    // session value override it.
    if (urlOrgSlugRef.current) return;
    if (sessionActiveOrganizationId) {
      // Only adopt the active id here. `initialLoadDone`/`loading` flip after
      // the org list has actually loaded; flipping them early made the list
      // render "No organizations yet" and slug pages 404 on a direct load.
      setActiveOrganizationId(sessionActiveOrganizationId);
    }
  }, [enabled, isSwitching, sessionActiveOrganizationId, sessionPending]);

  const refreshOrganizations = useCallback(
    async (options?: { activeOrganizationId?: string | null }) => {
      if (!enabled) return;
      const list = await authClient.organization.list();
      // A misrouted auth call can return a non-array body; never crash on it.
      const data = (Array.isArray(list.data) ? list.data : []) as OrgListItem[];
      setOrgs(data);
      const urlOrgId = urlOrgSlugRef.current
        ? data.find((org) => org.slug === urlOrgSlugRef.current)?.id
        : undefined;
      const active =
        options?.activeOrganizationId ??
        urlOrgId ??
        sessionActiveOrganizationId ??
        data[0]?.id ??
        null;

      if (
        shouldBootstrapSessionActiveOrganization(
          sessionActiveOrganizationId,
          active,
          options?.activeOrganizationId,
        )
      ) {
        try {
          await authClient.organization.setActive({ organizationId: active });
          await refetchSession();
        } catch {
          // Session may not be ready yet; org-scoped queries retry after focus/switch.
        }
      }

      setActiveOrganizationId(active);
    },
    [enabled, refetchSession, sessionActiveOrganizationId],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (sessionPending) {
      return;
    }

    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;

    let cancelled = false;
    void (async () => {
      try {
        await refreshOrganizations();
      } catch {
        if (!cancelled) toast.error("Could not load organizations");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoadDone(true);
          void queryClient.prefetchQuery(trpc.projects.list.queryOptions());
          void queryClient.prefetchQuery(
            trpc.dashboard.getOverview.queryOptions(),
          );
          void queryClient.prefetchQuery(
            trpc.permissions.snapshot.queryOptions({}),
          );
          void queryClient.prefetchQuery(
            trpc.notifications.unreadCount.queryOptions(),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, queryClient, refreshOrganizations, sessionPending]);

  // Follow the URL org on every client navigation into /[org]/…. After a
  // switch the URL moves to the new org, so this agrees with the switch.
  const urlOrgId = urlOrgSlug
    ? (orgs.find((org) => org.slug === urlOrgSlug)?.id ?? null)
    : null;
  useEffect(() => {
    if (!enabled || isSwitching || !urlOrgId) return;
    setActiveOrganizationId(urlOrgId);
  }, [enabled, isSwitching, urlOrgId]);

  const applyActiveOrganization = useCallback(
    async (organizationId: string, _options?: { awaitRefresh?: boolean }) => {
      setActiveOrganizationId(organizationId);
      setIsSwitching(true);
      try {
        await authClient.organization.setActive({ organizationId });
        await refetchSession();

        await invalidateAfterOrganizationChange(queryClient);

        const [listResult] = await Promise.all([
          queryClient.fetchQuery(trpc.projects.list.queryOptions()),
          queryClient.fetchQuery(trpc.dashboard.getOverview.queryOptions()),
          refreshOrganizations({ activeOrganizationId: organizationId }),
        ]);

        const orgList = await authClient.organization.list();
        const nextOrg = ((orgList.data ?? []) as OrgListItem[]).find(
          (org) => org.id === organizationId,
        );
        const projectSlugs = new Set(
          (listResult?.data ?? [])
            .map((row) => row.slug)
            .filter((slug): slug is string => Boolean(slug?.trim())),
        );
        const redirectTo = pathAfterOrganizationSwitch(
          pathname,
          nextOrg,
          projectSlugs,
        );
        if (redirectTo) {
          router.replace(redirectTo);
        }
        void router.refresh();
      } finally {
        setIsSwitching(false);
      }
    },
    [pathname, queryClient, refetchSession, refreshOrganizations, router],
  );

  const setActiveOrganization = useCallback(
    async (organizationId: string) => {
      if (!enabled) return;
      await applyActiveOrganization(organizationId);
    },
    [applyActiveOrganization, enabled],
  );

  const afterOrganizationCreated = useCallback(
    async (organizationId: string) => {
      if (!enabled) return;
      await applyActiveOrganization(organizationId, { awaitRefresh: true });
    },
    [applyActiveOrganization, enabled],
  );

  const value = useMemo<ActiveOrganizationContextValue>(
    () => ({
      enabled,
      orgs,
      activeOrganizationId,
      loading,
      isSwitching,
      initialLoadDone,
      refreshOrganizations,
      setActiveOrganization,
      afterOrganizationCreated,
    }),
    [
      enabled,
      orgs,
      activeOrganizationId,
      loading,
      isSwitching,
      initialLoadDone,
      refreshOrganizations,
      setActiveOrganization,
      afterOrganizationCreated,
    ],
  );

  return (
    <ActiveOrganizationContext.Provider value={value}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

export function useActiveOrganization() {
  const ctx = useContext(ActiveOrganizationContext);
  if (!ctx) {
    throw new Error(
      "useActiveOrganization must be used within ActiveOrganizationProvider",
    );
  }
  return ctx;
}

export function useOrgQueryScopeKey(): string {
  const { enabled, activeOrganizationId } = useActiveOrganization();
  if (!enabled) return "orgs-off";
  return activeOrganizationId ?? "no-active-org";
}
