import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { studioRouter } from "@loftlancer/api/routers/studio";
import type { auth } from "@loftlancer/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import type { ServerTiming } from "@/lib/server-timing";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

type ProjectBySlugPayload = Awaited<
  ReturnType<
    ReturnType<typeof studioRouter.createCaller>["projects"]["getBySlug"]
  >
>;

export async function hydrateProjectDetailQueries(
  queryClient: QueryClient,
  slug: string,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  timing?: ServerTiming,
): Promise<ProjectBySlugPayload> {
  const caller = studioRouter.createCaller({ session });

  const measure = async <T>(name: string, fn: () => Promise<T>) =>
    timing ? timing.measure(name, fn) : fn();

  const projectRes = await measure("project", () =>
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.projects.getBySlug.queryOptions({ slug }),
      () => caller.projects.getBySlug({ slug }),
    ),
  );

  const firstEnvironmentId = projectRes.data.environments[0]?.id;
  if (firstEnvironmentId) {
    try {
      await measure("variables", () =>
        prefetchWithCaller(
          queryClient,
          trpcQueryOptions.environmentVariables.list.queryOptions({
            environmentId: firstEnvironmentId,
          }),
          () =>
            caller.environmentVariables.list({
              environmentId: firstEnvironmentId,
            }),
        ),
      );
    } catch {
      // Variables are optional for first paint; client will refetch.
    }
  }

  return projectRes;
}

export async function dehydrateProjectDetail(slug: string) {
  const queryClient = new QueryClient();
  const session = await getServerSession();
  if (!session) {
    return dehydrate(queryClient);
  }

  try {
    await hydrateProjectDetailQueries(queryClient, slug, session);
  } catch {
    // Client will refetch (e.g. missing active org).
  }

  return dehydrate(queryClient);
}
