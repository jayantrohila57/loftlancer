"use client";

import type { ActionName } from "@features/authorization/utils";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const POLL_MS = 30_000;

export function usePermissionsSnapshot(projectId?: string) {
  return useQuery({
    ...trpc.permissions.snapshot.queryOptions(
      projectId ? { projectId } : undefined,
    ),
    staleTime: POLL_MS,
    refetchInterval: POLL_MS,
  });
}

export function useCan(action: ActionName, options?: { projectId?: string }) {
  const { data, isPending, isFetching } = usePermissionsSnapshot(
    options?.projectId,
  );
  const allowed = data?.actions?.[action] === true;
  const reason = allowed ? undefined : "denied";
  const isLoading = isPending || isFetching;
  return { allowed, reason, isLoading };
}

export function useUnassignedOrgMember() {
  const { data, isLoading } = usePermissionsSnapshot();
  return {
    unassigned: Boolean(data?.unassignedMember),
    isLoading,
  };
}
