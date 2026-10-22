import { getSessionActiveOrganizationId } from "@loftlancer/auth/session-types";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { PrivateDashboardShell } from "@/components/layout/private-dashboard-shell";
import { guardAuthenticatedPage } from "@/lib/page-guards";
import {
  dehydrateStudioShellQueries,
  orgSlugFromRequestPath,
} from "@/lib/shell-prefetch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await guardAuthenticatedPage();
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "";
  const search = requestHeaders.get("x-search") ?? "";
  const urlOrgSlug = orgSlugFromRequestPath(pathname, search);
  const dehydratedState = await dehydrateStudioShellQueries(session, {
    urlOrgSlug,
  });

  return (
    <HydrationBoundary state={dehydratedState}>
      <PrivateDashboardShell
        orgReady={Boolean(getSessionActiveOrganizationId(session))}
      >
        {children}
      </PrivateDashboardShell>
    </HydrationBoundary>
  );
}
