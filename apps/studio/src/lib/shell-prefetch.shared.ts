import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { prefetchWithCaller } from "@loftlancer/orpc/prefetch-with-caller";
import { studioRouter } from "@loftlancer/orpc/routers/studio";
import type { QueryClient } from "@tanstack/react-query";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

/** Prefetch sidebar navigator; failures must not break the shell (client refetch). */
export async function prefetchSidebarNavigatorSettled(
  queryClient: QueryClient,
  session: AuthSession,
  orgSlug: string,
): Promise<void> {
  const caller = studioRouter.createCaller({ session });
  await Promise.allSettled([
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.sidebar.navigator.queryOptions({ orgSlug }),
      () => caller.sidebar.navigator({ orgSlug }),
    ),
  ]);
}
