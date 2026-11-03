"use client";
import {
  type TeamInvitationsInitial,
  useTeamInvitationsScreen,
} from "../hooks/client.use-teams-invitations-screen.hook";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";
import { TeamInvitationsContent } from "./client.invitations.content";
import { TeamsResponseMessage } from "./client.response.boundary";
export function TeamInvitationsPage({
  teamId,
  initialData,
}: {
  slug: string;
  initialData?: TeamInvitationsInitial;
  teamId: string;
}) {
  const state = useTeamInvitationsScreen(teamId, initialData);
  const query = state.query;
  if (query.isPending) return <TeamTableSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Could not load team invitations. Please try again."
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
  return <TeamInvitationsContent state={state} />;
}
