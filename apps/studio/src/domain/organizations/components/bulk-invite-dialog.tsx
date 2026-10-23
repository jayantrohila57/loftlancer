"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Label } from "@loftlancer/ui/label";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { GuardedDialog } from "@/components/patterns/guarded-dialog";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { useNotificationMutations } from "@/domain/notifications/hooks/use-notifications";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { authClient } from "@/lib/auth-client";
import {
  assignableInviteRoles,
  type OrgInviteRole,
  type ParsedInviteEmail,
  parseInviteEmails,
} from "@/lib/invite-emails";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

const STATUS_LABEL: Record<ParsedInviteEmail["status"], string | null> = {
  valid: null,
  invalid: "Invalid",
  duplicate: "Duplicate",
  member: "Already a member",
  pending: "Already invited",
};

type BulkInviteDialogProps = {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Inviter's org role; fetched from Better Auth when omitted. */
  inviterRole?: string | null;
  memberEmails?: string[];
  pendingEmails?: string[];
  onInvited?: () => void;
  fixedTeamId?: string;
  fixedProjectId?: string;
};

/** Bulk email invite after reui dialog-2: paste emails, pick a role, send N invites. */
export function BulkInviteDialog({
  organizationId,
  open,
  onOpenChange,
  inviterRole,
  memberEmails,
  pendingEmails,
  onInvited,
  fixedTeamId,
  fixedProjectId,
}: BulkInviteDialogProps) {
  const { data: session } = useSession();
  const { syncInvitationReceived } = useNotificationMutations();
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [raw, setRaw] = useState("");
  const [role, setRole] = useState<OrgInviteRole>("member");
  const [teamId, setTeamId] = useState(fixedTeamId ?? "");
  const [projectId, setProjectId] = useState(fixedProjectId ?? "");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState<Record<string, string>>({});
  const invitationPermission = useCan("member.invite");
  const createInvitation = useMutation(
    trpc.organizations.createInvitation.mutationOptions(),
  );
  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: open,
  });
  const projectsQuery = useQuery({
    ...trpc.projects.list.queryOptions(),
    enabled: open,
  });

  const roleQuery = useQuery({
    queryKey: ["org-active-member-role", organizationId],
    queryFn: async () => {
      const res = await authClient.organization.getActiveMemberRole({
        query: { organizationId },
      });
      return (res.data?.role as string | undefined) ?? null;
    },
    enabled:
      open &&
      inviterRole === undefined &&
      !projectId &&
      Boolean(organizationId),
  });
  const effectiveRole =
    inviterRole !== undefined ? inviterRole : (roleQuery.data ?? null);
  const builtInRoles = assignableInviteRoles(effectiveRole);
  const roles =
    !projectId && invitationPermission.allowed
      ? builtInRoles.length > 0
        ? builtInRoles
        : ["member" as const]
      : builtInRoles;

  const parsed = useMemo(
    () => parseInviteEmails(raw, { memberEmails, pendingEmails }),
    [raw, memberEmails, pendingEmails],
  );
  const valid = parsed.filter((p) => p.status === "valid");
  const problems = parsed.filter((p) => p.status !== "valid").length;
  const teams = teamsQuery.data?.items ?? [];
  const projects = projectsQuery.data?.data ?? [];
  const selectedTeamName =
    teams.find((team) => team.id === teamId)?.name ??
    (teamId ? "the selected team" : null);
  const selectedProjectName =
    projects.find((project) => project.id === projectId)?.name ??
    (projectId ? "the selected project" : null);
  const accessSummary = `This person will join the organization as a ${projectId ? "member" : role}${selectedTeamName ? `, join ${selectedTeamName}` : ""}${selectedProjectName ? `, and get read-only access to ${selectedProjectName}` : ""}.`;

  const reset = () => {
    setRaw("");
    setRole("member");
    setTeamId(fixedTeamId ?? "");
    setProjectId(fixedProjectId ?? "");
    setFailed({});
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on close only
  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid.length === 0 || (!projectId && roles.length === 0)) return;
    setPending(true);
    const nextFailed: Record<string, string> = {};
    let sent = 0;
    for (const { email } of valid) {
      try {
        await createInvitation.mutateAsync({
          email,
          role: projectId ? "member" : role,
          organizationId,
          ...(teamId ? { teamId } : {}),
          ...(projectId ? { projectId } : {}),
        });
      } catch (error) {
        nextFailed[email] =
          error instanceof Error ? error.message : "Could not invite";
        continue;
      }
      sent += 1;
      if (isNotificationsEnabledOnClient() && session?.user?.id) {
        syncInvitationReceived.mutate({ organizationId, email });
      }
    }
    setPending(false);
    if (sent > 0) {
      captureEvent(STUDIO_EVENTS.membersInvited, {
        count: sent,
        role,
        with_team: Boolean(teamId),
        with_project: Boolean(projectId),
      });
      onInvited?.();
    }
    const failures = Object.keys(nextFailed).length;
    if (failures === 0) {
      toast.success(
        `${sent} ${sent === 1 ? "invitation" : "invitations"} sent`,
      );
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
      return;
    }
    // Keep only the failed emails so the user can fix and retry.
    setFailed(nextFailed);
    setRaw(Object.keys(nextFailed).join("\n"));
    toast.error(
      sent > 0
        ? `${sent} sent, ${failures} failed`
        : `${failures} ${failures === 1 ? "invitation" : "invitations"} failed`,
    );
  };

  return (
    <GuardedDialog
      open={open}
      onOpenChange={onOpenChange}
      isDirty={raw.trim().length > 0}
      onDiscard={reset}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <DialogPopup className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-base">
              <AppIcon name="invite" className="size-4" />
              {projectId
                ? "Invite members to this project"
                : teamId
                  ? "Invite members to this team"
                  : "Invite members"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Paste email addresses separated by commas, spaces, or new lines.
              Review the access summary below before sending.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-invite-emails" className="text-sm">
                Emails
              </Label>
              <Textarea
                id="bulk-invite-emails"
                value={raw}
                onChange={(e) => {
                  setRaw(e.target.value);
                  if (Object.keys(failed).length) setFailed({});
                }}
                placeholder={"ana@example.com, li@example.com\nsam@example.com"}
                className="h-24 resize-none text-sm"
                disabled={pending}
                autoFocus
              />
              {/* Fixed-height list so validation never resizes the dialog. */}
              <div
                className="h-28 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-1.5"
                aria-live="polite"
              >
                {parsed.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    Recipients appear here as you type.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {parsed.map((row, i) => {
                      const error = failed[row.email];
                      const label = error ?? STATUS_LABEL[row.status];
                      const bad = Boolean(error) || row.status !== "valid";
                      return (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: duplicates share an email
                          key={`${row.email}-${i}`}
                          title={label ?? undefined}
                          className={cn(
                            "flex h-6 max-w-full items-center gap-1 rounded-md border px-1.5 text-xs",
                            bad
                              ? "border-destructive/40 bg-destructive/5 text-destructive"
                              : "border-border/60 bg-background",
                          )}
                        >
                          <span className="truncate">{row.email}</span>
                          {label ? (
                            <span className="shrink-0 opacity-80">
                              · {label}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <p className="flex gap-x-3 text-muted-foreground text-xs tabular-nums">
                <span>{valid.length} ready</span>
                {problems > 0 ? (
                  <span className="text-destructive">{problems} skipped</span>
                ) : null}
              </p>
            </div>
            {!fixedProjectId || !fixedTeamId ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {!fixedTeamId ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="bulk-invite-team" className="text-sm">
                      Team (optional)
                    </Label>
                    <SearchableCombobox
                      id="bulk-invite-team"
                      value={teamId || "none"}
                      onChange={(value) =>
                        setTeamId(value === "none" ? "" : value)
                      }
                      disabled={pending}
                      loading={teamsQuery.isPending}
                      ariaLabel="Team"
                      options={[
                        { value: "none", label: "No team" },
                        ...teams.map((team) => ({
                          value: team.id,
                          label: team.name,
                        })),
                      ]}
                    />
                  </div>
                ) : null}
                {!fixedProjectId ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="bulk-invite-project" className="text-sm">
                      Project (optional)
                    </Label>
                    <SearchableCombobox
                      id="bulk-invite-project"
                      value={projectId || "none"}
                      onChange={(value) => {
                        const next = value === "none" ? "" : value;
                        setProjectId(next);
                        if (next) setRole("member");
                      }}
                      disabled={pending}
                      loading={projectsQuery.isPending}
                      ariaLabel="Project"
                      options={[
                        { value: "none", label: "No project" },
                        ...projects.map((project) => ({
                          value: project.id,
                          label: project.name,
                        })),
                      ]}
                    />
                    <p className="text-muted-foreground text-xs">
                      Project invitations grant read-only access.
                    </p>
                  </div>
                ) : null}
                {!projectId && !fixedProjectId ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="bulk-invite-role" className="text-sm">
                      Organization role
                    </Label>
                    <SearchableCombobox
                      id="bulk-invite-role"
                      value={role}
                      onChange={(value) => setRole(value as OrgInviteRole)}
                      disabled={pending || roles.length === 0}
                      ariaLabel="Organization role"
                      className="capitalize"
                      options={roles.map((r) => ({
                        value: r,
                        label: r.charAt(0).toUpperCase() + r.slice(1),
                      }))}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            {!projectId && effectiveRole !== null && roles.length === 0 ? (
              <Badge variant="outline" className="w-fit text-xs">
                Your role can't invite members
              </Badge>
            ) : null}
            <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
              {accessSummary}
            </p>
          </DialogPanel>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost" disabled={pending} />
              }
            >
              Cancel
            </DialogClose>
            <SubmitButton
              isLoading={pending}
              loadingLabel="Sending invites…"
              disabled={
                valid.length === 0 || (!projectId && roles.length === 0)
              }
              className="min-w-32 tabular-nums"
            >
              {valid.length > 0
                ? `Send ${valid.length} ${valid.length === 1 ? "invite" : "invites"}`
                : "Send invites"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogPopup>
    </GuardedDialog>
  );
}
