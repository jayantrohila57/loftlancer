"use client";
import {
  type TeamMembersInitial,
  useTeamMembersScreen,
} from "../hooks/client.use-teams-members-screen.hook";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";
import { TeamMembersContent } from "./client.members.content";
import { TeamsResponseMessage } from "./client.response.boundary";
export function TeamMembersPage({
  teamId,
  initialData,
}: {
  teamId: string;
  initialData?: TeamMembersInitial;
}) {
  const state = useTeamMembersScreen(teamId, initialData);
  const query = state.members;
  if (query.isPending) return <TeamTableSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Could not load team members. Please try again."
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
  const secondary = state.availableMembers;
  return (
    <>
      {secondary.response && secondary.response.status !== "success" && (
        <TeamsResponseMessage
          message={secondary.response.message}
          error={secondary.response.status === "error"}
          retry={() => void secondary.refetch()}
        />
      )}
      <TeamMembersContent teamId={teamId} state={state} />
    </>
  );
}
