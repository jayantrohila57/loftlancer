"use client";

import type { QueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const PROJECT_DETAIL_STALE_MS = 5 * 60 * 1000;

export function prefetchProjectDetail(queryClient: QueryClient, slug: string) {
  if (!slug.trim()) return;

  void queryClient.prefetchQuery({
    ...trpc.projects.getBySlug.queryOptions({ slug }),
    staleTime: PROJECT_DETAIL_STALE_MS,
  });
}

export const projectDetailQueryStaleTime = PROJECT_DETAIL_STALE_MS;
