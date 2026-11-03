"use client";
import {
  type TeamProjectsInitial,
  useTeamProjectsScreen,
} from "../hooks/client.use-teams-projects-screen.hook";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";
import { TeamProjectsContent } from "./client.projects.content";
import { TeamsResponseMessage } from "./client.response.boundary";
export function TeamProjectsPage({
  slug,
  teamId,
  initialData,
}: {
  slug: string;
  initialData?: TeamProjectsInitial;
  teamId: string;
}) {
  const state = useTeamProjectsScreen(teamId, initialData);
  const query = state.linked;
  if (query.isPending) return <TeamTableSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Could not load team projects. Please try again."
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
  const secondary = state.linkable;
  return (
    <>
      {secondary.response && secondary.response.status !== "success" && (
        <TeamsResponseMessage
          message={secondary.response.message}
          error={secondary.response.status === "error"}
          retry={() => void secondary.refetch()}
        />
      )}
      <TeamProjectsContent slug={slug} teamId={teamId} state={state} />
    </>
  );
}
