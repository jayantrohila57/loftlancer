"use client";
import { useQuery } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";
import { teamsQueryKeys } from "../../../utils/constants/utils.query-keys.constants";
export function useTeamsList(
  orgId: string,
  initialData: Awaited<ReturnType<typeof studioORPC.teams.list>>,
) {
  return useQuery({
    queryKey: teamsQueryKeys.list(orgId),
    queryFn: () => studioORPC.teams.list(),
    initialData,
    staleTime: 30_000,
    meta: { toastOnError: false },
  });
}
