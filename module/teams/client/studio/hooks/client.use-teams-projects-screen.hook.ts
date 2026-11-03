"use client";
import { useConfirm } from "@features/patterns/core/client/patterns.confirm-dialog";
import { useState } from "react";
import { studioORPC } from "@/lib/orpc";
import {
  useTeamsOperationMutation,
  useTeamsRowsQuery,
} from "./client.use-teams-operation.hook";
import { useCan } from "./client.use-teams-permission.hook";
export type TeamProjectsInitial = Awaited<
  ReturnType<typeof studioORPC.teams.projects>
>;
export function useTeamProjectsScreen(
  teamId: string,
  initialData?: TeamProjectsInitial,
) {
  const [projectId, setProjectId] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();
  const canManageProjectLinks = useCan("member.list");
  const linked = useTeamsRowsQuery(
    "projects",
    { teamId },
    () => studioORPC.teams.projects({ teamId }),
    true,
    initialData,
  );
  const linkable = useTeamsRowsQuery(
    "linkableProjects",
    { teamId },
    () => studioORPC.teams.linkableProjects({ teamId }),
    canManageProjectLinks.allowed,
  );
  const assign = useTeamsOperationMutation(
    "project.assign_team",
    (input: { teamId: string; projectId: string }) =>
      studioORPC.teams.projectAssign(input),
    () => setProjectId(""),
  );
  const remove = useTeamsOperationMutation(
    "project.assign_team",
    (input: { teamId: string; projectId: string }) =>
      studioORPC.teams.projectRemove(input),
  );
  return {
    projectId,
    setProjectId,
    confirm,
    ConfirmDialog,
    canManageProjectLinks,
    linked,
    linkable,
    assign,
    remove,
  };
}
