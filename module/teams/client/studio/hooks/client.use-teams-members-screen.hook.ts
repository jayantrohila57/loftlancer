"use client";
import { useConfirm } from "@features/patterns/core/client/patterns.confirm-dialog";
import { useState } from "react";
import { studioORPC } from "@/lib/orpc";
import {
  useTeamsOperationMutation,
  useTeamsRowsQuery,
} from "./client.use-teams-operation.hook";
import { useCan } from "./client.use-teams-permission.hook";
export type TeamMembersInitial = Awaited<
  ReturnType<typeof studioORPC.teams.members>
>;
export function useTeamMembersScreen(
  teamId: string,
  initialData?: TeamMembersInitial,
) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [userId, setUserId] = useState("");
  const canAddMembers = useCan("team.member.add", { teamId });
  const canChangeRoles = useCan("team.member.role.change", { teamId });
  const members = useTeamsRowsQuery(
    "members",
    { teamId },
    () => studioORPC.teams.members({ teamId }),
    true,
    initialData,
  );
  const availableMembers = useTeamsRowsQuery(
    "availableMembers",
    { teamId },
    () => studioORPC.teams.availableMembers({ teamId }),
    canAddMembers.allowed,
  );
  const add = useTeamsOperationMutation(
    "team.member.add",
    (input: { teamId: string; userId: string }) =>
      studioORPC.teams.addMember(input),
    () => setUserId(""),
  );
  const remove = useTeamsOperationMutation(
    "team.member.remove",
    (input: { teamId: string; userId: string }) =>
      studioORPC.teams.removeMember(input),
  );
  const changeRole = useTeamsOperationMutation(
    "team.member.role.change",
    (input: { teamId: string; userId: string; role: "lead" | "member" }) =>
      studioORPC.teams.updateMemberRole(input),
  );
  return {
    confirm,
    ConfirmDialog,
    userId,
    setUserId,
    canAddMembers,
    canChangeRoles,
    members,
    availableMembers,
    add,
    remove,
    changeRole,
  };
}
