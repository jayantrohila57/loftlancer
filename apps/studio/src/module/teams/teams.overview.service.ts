import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { studioRouter } from "@loftlancer/api/routers/studio";
import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@loftlancer/auth/session-types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export async function hydrateTeamOverview(
  session: AuthSession,
  organizationId: string,
  teamId: string,
) {
  const client = new QueryClient();
  if (getSessionActiveOrganizationId(session) !== organizationId)
    return dehydrate(client);
  const caller = studioRouter.createCaller({ session });
  const input = { teamId };
  try {
    await prefetchWithCaller(
      client,
      trpcQueryOptions.teams.get.queryOptions(input),
      () => caller.teams.get(input),
    );
  } catch {
    // The client component retains its retry state when prefetch cannot complete.
  }
  return dehydrate(client);
}
