import "server-only";

import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { prefetchWithCaller } from "@loftlancer/orpc/prefetch-with-caller";
import { studioRouter } from "@loftlancer/orpc/routers/studio";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export async function hydrateNotificationsList(session: AuthSession) {
  const client = new QueryClient();
  const caller = studioRouter.createCaller({ session });
  const input = { limit: 40, unreadOnly: false };
  try {
    await prefetchWithCaller(
      client,
      trpcQueryOptions.notifications.list.queryOptions(input),
      () => caller.notifications.list(input),
    );
  } catch {
    // Preserve the client retry and error state if prefetch fails.
  }
  return dehydrate(client);
}
