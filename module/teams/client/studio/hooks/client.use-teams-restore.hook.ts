"use client";
import { studioORPC } from "@/lib/orpc";
import { useTeamsOperationMutation } from "./client.use-teams-operation.hook";
export function useTeamRestore() {
  return useTeamsOperationMutation(
    "team.restore",
    (input: { teamId: string }) => studioORPC.teams.restore(input),
  );
}
