"use client";
import type { ActionName } from "@loftlancer/actions";
import { useModuleOrganizationId } from "@module/shared/client/client.scope.provider";
import { useQuery } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";
export function useCan(
  action: ActionName,
  options?: { projectId?: string; teamId?: string },
) {
  const orgId = useModuleOrganizationId();
  const input = {
    ...(options?.projectId ? { projectId: options.projectId } : {}),
    ...(options?.teamId ? { teamId: options.teamId } : {}),
  };
  const query = useQuery({
    queryKey: ["teams", orgId, "permissions", input],
    queryFn: () => studioORPC.permissions.snapshot(input),
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });
  return {
    orgRole: query.data?.orgRole,
    allowed: query.data?.actions?.[action] === true,
    isLoading: query.isPending,
    reason: query.data?.actions?.[action] ? undefined : "denied",
  };
}
