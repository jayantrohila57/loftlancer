import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { studioRouter } from "@loftlancer/api/routers/studio";
import type { AuthSession } from "@loftlancer/auth/session-types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { orgSlugFromRequestPath } from "@/lib/org-slug-from-request-path";
import { prefetchSidebarNavigatorSettled } from "@/lib/shell-prefetch.shared";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export { orgSlugFromRequestPath, prefetchSidebarNavigatorSettled };

/** Prefetch queries for private shell (projects list removed in product reset). */
export async function dehydrateStudioShellQueries(
  session: AuthSession,
  options?: { urlOrgSlug?: string | null },
) {
  const queryClient = new QueryClient();
  const caller = studioRouter.createCaller({ session });
  const urlOrgSlug = options?.urlOrgSlug ?? null;

  const prefetches: Promise<unknown>[] = [
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.permissions.snapshot.queryOptions({}),
      () => caller.permissions.snapshot({}),
    ),
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.notifications.unreadCount.queryOptions(),
      () => caller.notifications.unreadCount(),
    ),
  ];

  if (urlOrgSlug) {
    prefetches.push(
      prefetchSidebarNavigatorSettled(queryClient, session, urlOrgSlug),
    );
  }

  await Promise.allSettled(prefetches);

  return dehydrate(queryClient);
}
