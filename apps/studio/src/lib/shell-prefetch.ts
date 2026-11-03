import "server-only";

import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { prefetchWithCaller } from "@loftlancer/orpc/prefetch-with-caller";
import { studioRouter } from "@loftlancer/orpc/routers/studio";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { orgSlugFromRequestPath } from "@/lib/org-slug-from-request-path";
import { prefetchSidebarNavigatorSettled } from "@/lib/shell-prefetch.shared";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export { orgSlugFromRequestPath, prefetchSidebarNavigatorSettled };

/** Prefetch queries shared by the private dashboard shell (sidebar, gates). */
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
      trpcQueryOptions.projects.list.queryOptions(),
      () => caller.projects.list(),
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
