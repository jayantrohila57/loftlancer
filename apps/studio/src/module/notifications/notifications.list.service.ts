import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { studioRouter } from "@loftlancer/api/routers/studio";
import type { AuthSession } from "@loftlancer/auth/session-types";
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
