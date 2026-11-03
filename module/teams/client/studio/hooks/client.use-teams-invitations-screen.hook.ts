"use client";
import {
  assignableInviteRoles,
  type OrgInviteRole,
  parseInviteEmails,
} from "@module/organizations/utils/utils.invite-emails";
import { useRef, useState } from "react";
import { studioORPC } from "@/lib/orpc";
import type { TeamInvitationListInput } from "../../../utils/validation/utils.team-extended.validation";
import {
  useTeamsOperationMutation,
  useTeamsOperationQuery,
} from "./client.use-teams-operation.hook";
import { useCan } from "./client.use-teams-permission.hook";
export type TeamInvitationsInitial = Awaited<
  ReturnType<typeof studioORPC.teams.invitationList>
>;
export function useTeamInvitationsScreen(
  teamId: string,
  initialData?: TeamInvitationsInitial,
) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] =
    useState<TeamInvitationListInput["status"]>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [raw, setRaw] = useState("");
  const [role, setRole] = useState<OrgInviteRole>("member");
  const [sending, setSending] = useState(false);
  const [failures, setFailures] = useState<Record<string, string>>({});
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const permission = useCan("member.invite", { teamId });
  const revokePermission = useCan("invitation.cancel", { teamId });
  const addPermission = useCan("team.member.add", { teamId });
  const input = {
    teamId,
    status,
    search: search.trim() || undefined,
    limit: 50,
    offset: page * 50,
  };
  const query = useTeamsOperationQuery(
    "invitationList",
    input,
    () => studioORPC.teams.invitationList(input),
    true,
    status === "pending" && !search && page === 0 ? initialData : undefined,
  );
  const context = useTeamsOperationQuery(
    "invitationContext",
    { teamId },
    () => studioORPC.teams.invitationContext({ teamId }),
    open,
  );
  const create = useTeamsOperationMutation(
    "member.invite",
    (input: { teamId: string; email: string; role: OrgInviteRole }) =>
      studioORPC.teams.invitationCreate(input),
  );
  const resend = useTeamsOperationMutation(
    "member.invite",
    (input: { teamId: string; invitationId: string }) =>
      studioORPC.teams.invitationResend(input),
  );
  const revoke = useTeamsOperationMutation(
    "invitation.cancel",
    (input: { teamId: string; invitationId: string }) =>
      studioORPC.teams.invitationRevoke(input),
  );
  const roles = assignableInviteRoles(permission.orgRole);
  const parsed = parseInviteEmails(raw, context.data ?? {});
  const valid = parsed.filter((p) => p.status === "valid");
  const reset = () => {
    setRaw("");
    setRole("member");
    setFailures({});
  };
  const submit = async () => {
    if (
      sending ||
      !valid.length ||
      !roles.includes(role) ||
      context.isPending ||
      context.isError ||
      context.response?.status !== "success"
    )
      return;
    setSending(true);
    const next: Record<string, string> = {};
    try {
      for (const { email } of valid) {
        try {
          const response = await create.mutateAsync({ teamId, email, role });
          if (response.status !== "success") next[email] = response.message;
        } catch {
          next[email] = "Could not send invitation. Please try again.";
        }
      }
      setFailures(next);
      if (Object.keys(next).length) setRaw(Object.keys(next).join("\n"));
      else {
        closeWithoutPromptRef.current?.();
        setOpen(false);
        reset();
      }
    } finally {
      setSending(false);
    }
  };
  return {
    teamId,
    open,
    setOpen,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    query,
    context,
    raw,
    setRaw,
    role,
    setRole,
    roles,
    parsed,
    valid,
    failures,
    sending,
    submit,
    reset,
    closeWithoutPromptRef,
    resend,
    revoke,
    canInvite: permission.allowed && addPermission.allowed,
    canResend: permission.allowed,
    canRevoke: revokePermission.allowed,
  };
}
