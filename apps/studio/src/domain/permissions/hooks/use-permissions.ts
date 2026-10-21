"use client";

import type { ActionName } from "@loftlancer/actions";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const POLL_MS = 60_000;

export function usePermissionsSnapshot(projectId?: string, teamId?: string) {
  const input = {
    ...(projectId ? { projectId } : {}),
    ...(teamId ? { teamId } : {}),
  };
  return useQuery({
    ...trpc.permissions.snapshot.queryOptions(input),
    staleTime: POLL_MS,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: false,
  });
}

export function useCan(
  action: ActionName,
  options?: { projectId?: string; teamId?: string },
) {
  const { data, isPending } = usePermissionsSnapshot(
    options?.projectId,
    options?.teamId,
  );
  const allowed = data?.actions?.[action] === true;
  const reason = allowed ? undefined : "denied";
  const isLoading = isPending && data === undefined;
  return { allowed, reason, isLoading };
}

export function useUnassignedOrgMember() {
  const { data, isLoading } = usePermissionsSnapshot();
  return {
    unassigned: Boolean(data?.unassignedMember),
    isLoading,
  };
}
