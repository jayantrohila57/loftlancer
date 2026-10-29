"use client";

import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useSession } from "@/module/auth/auth.auth.actions";
import { useRouteScope } from "@/utils/use-route-scope";
import { isOrgScopedQueryReady } from "./org-scoped-query-ready";

/** When false, defer org-scoped tRPC queries (org switch / bootstrap). */
export function useOrgQueryEnabled() {
  const {
    isSwitching,
    enabled: orgsEnabled,
    activeOrganizationId,
  } = useActiveOrganization();
  const { org: urlOrgSlug } = useRouteScope();
  const { data: session, isPending: sessionPending } = useSession();
  const sessionOrgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)
      ?.activeOrganizationId ?? null;

  return isOrgScopedQueryReady({
    orgsEnabled,
    isSwitching,
    sessionPending,
    activeOrganizationId,
    sessionOrganizationId: sessionOrgId,
    urlOrgSlug,
  });
}
