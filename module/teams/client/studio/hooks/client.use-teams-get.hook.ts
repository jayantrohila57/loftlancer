"use client";
import { useQuery } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";
import { teamsQueryKeys } from "../../../utils/constants/utils.query-keys.constants";
export function useTeamGet(
  orgId: string,
  teamId: string,
  initialData: Awaited<ReturnType<typeof studioORPC.teams.get>>,
) {
  return useQuery({
    queryKey: teamsQueryKeys.get(orgId, teamId),
    queryFn: () => studioORPC.teams.get({ teamId }),
    initialData,
    staleTime: 30_000,
    meta: { toastOnError: false },
  });
}
