import type { QueryClient } from "@tanstack/react-query";

/** SSR prefetch: reuse TanStack Query keys from `trpc.*.queryOptions()` with a server `createCaller`. */
export async function prefetchWithCaller<TData>(
  queryClient: QueryClient,
  queryOptions: { queryKey: readonly unknown[] },
  queryFn: () => Promise<TData>,
): Promise<TData> {
  return queryClient.fetchQuery({
    ...queryOptions,
    queryFn,
  });
}
