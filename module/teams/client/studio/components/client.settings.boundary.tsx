"use client";
import {
  type TeamSettingsInitial,
  useTeamSettingsScreen,
} from "../hooks/client.use-teams-settings-screen.hook";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";
import { TeamsResponseMessage } from "./client.response.boundary";
import { TeamSettingsContent } from "./client.settings.content";
export function TeamSettingsPage({
  slug,
  teamId,
  initialData,
}: {
  slug: string;
  initialData?: TeamSettingsInitial;
  teamId: string;
}) {
  const state = useTeamSettingsScreen(slug, teamId, initialData);
  const query = state.teams;
  if (query.isPending) return <TeamOverviewSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Could not load team settings. Please try again."
        error
        retry={() => void query.refetch()}
      />
    );
  if (query.response && query.response.status !== "success")
    return (
      <TeamsResponseMessage
        message={query.response.message}
        error={query.response.status === "error"}
        retry={() => void query.refetch()}
      />
    );
  return <TeamSettingsContent teamId={teamId} state={state} />;
}
