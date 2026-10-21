"use client";

import { PROJECT_MEMBER_GRANT_KEYS } from "@loftlancer/actions";
import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { Checkbox } from "@loftlancer/ui/checkbox";
import { Label } from "@loftlancer/ui/label";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { LoadingButton } from "@loftlancer/ui/patterns/loading-button";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@loftlancer/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { ErrorState } from "@/components/patterns/error-state";
import { SettingsRow } from "@/components/patterns/settings-layout";
import { Can } from "@/domain/permissions/components/can";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useConfirm } from "@/hooks/use-confirm";
import { formatActionLabel } from "@/lib/format-action-label";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type ProjectAccessSectionProps = {
  project: ProjectOutput;
};

export function ProjectAccessSection({ project }: ProjectAccessSectionProps) {
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const { activeOrganizationId } = useActiveOrganization();
  const [managerUserId, setManagerUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [grantUserId, setGrantUserId] = useState("");
  const [grantSelection, setGrantSelection] = useState<string[]>([]);
  const canAssignManager = useCan("project.assign_manager");
  const canAssignTeam = useCan("project.assign_team", {
    projectId: project.id,
  });
  const canManageGrants = useCan("project.permission.grant", {
    projectId: project.id,
  });

  const summaryQuery = useQuery(
    trpc.projectAccess.getSummary.queryOptions({ projectId: project.id }),
  );

  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: Boolean(activeOrganizationId) && canAssignTeam.allowed,
  });
  const membersQuery = useQuery({
    ...trpc.organizations.listMembers.queryOptions(),
    enabled:
      Boolean(activeOrganizationId) &&
      (canAssignManager.allowed || canManageGrants.allowed),
  });

  const orgMembers = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data?.items],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.projectAccess.getSummary.queryKey({
        projectId: project.id,
      }),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.permissions.snapshot.queryKey({}),
    });
  };

  const assignManager = useMutation(
    trpc.projectAccess.assignManager.mutationOptions({
      onSuccess: () => {
        toast.success("Project manager assigned");
        setManagerUserId("");
        invalidate();
      },
      onError: () => toast.error("Could not assign manager"),
    }),
  );

  const removeManager = useMutation(
    trpc.projectAccess.removeManager.mutationOptions({
      onSuccess: () => {
        toast.success("Project manager removed");
        invalidate();
      },
      onError: () => toast.error("Could not remove manager"),
    }),
  );

  const assignTeam = useMutation(
    trpc.projectAccess.assignTeam.mutationOptions({
      onSuccess: () => {
        toast.success("Team linked to project");
        setTeamId("");
        invalidate();
      },
      onError: () => toast.error("Could not assign team"),
    }),
  );

  const removeTeam = useMutation(
    trpc.projectAccess.removeTeam.mutationOptions({
      onSuccess: () => {
        toast.success("Team removed from project");
        invalidate();
      },
      onError: () => toast.error("Could not remove team"),
    }),
  );

  const setGrants = useMutation(
    trpc.projectAccess.setMemberGrants.mutationOptions({
      onSuccess: () => {
        toast.success("Member grants updated");
        invalidate();
      },
      onError: () => toast.error("Could not update grants"),
    }),
  );

  const summary = summaryQuery.data;
  const teams = teamsQuery.data?.items ?? [];
  const linkedTeamIds = new Set(summary?.teams.map((row) => row.teamId) ?? []);
  const availableTeams = teams.filter((team) => !linkedTeamIds.has(team.id));

  const loadGrantsForUser = (userId: string) => {
    setGrantUserId(userId);
    const row = summary?.memberGrants.find((g) => g.userId === userId);
    setGrantSelection(row?.grants ?? []);
  };

  if (
    summaryQuery.isPending ||
    canAssignManager.isLoading ||
    canAssignTeam.isLoading ||
    canManageGrants.isLoading ||
    (canAssignTeam.allowed && teamsQuery.isLoading) ||
    ((canAssignManager.allowed || canManageGrants.allowed) &&
      membersQuery.isLoading)
  ) {
    return (
      <div className="flex min-w-0 flex-col gap-4">
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={2} />
        <AccordionSectionSkeleton rows={2} />
      </div>
    );
  }

  if (
    summaryQuery.isError ||
    (canAssignTeam.allowed && teamsQuery.isError) ||
    ((canAssignManager.allowed || canManageGrants.allowed) &&
      membersQuery.isError)
  ) {
    return (
      <ErrorState
        title="Could not load project access"
        description="Try loading the project’s access settings again."
        onRetry={() => {
          void summaryQuery.refetch();
          if (canAssignTeam.allowed) void teamsQuery.refetch();
          if (canAssignManager.allowed || canManageGrants.allowed) {
            void membersQuery.refetch();
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Can action="project.assign_manager">
        <AccordionSection
          title="Project managers"
          description="Managers assigned to this project can manage resources and member grants."
        >
          {summary?.managers.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.managers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name ?? row.email ?? row.userId}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={removeManager.isPending}
                        onClick={() =>
                          confirm({
                            title: `Remove ${row.name ?? row.email ?? "this manager"}?`,
                            description:
                              "They will lose project manager permissions. Their organization role and any direct member grants stay in place.",
                            confirmLabel: "Remove manager",
                            variant: "destructive",
                            onConfirm: async () => {
                              await removeManager.mutateAsync({
                                projectId: project.id,
                                userId: row.userId,
                              });
                            },
                          })
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-4 pb-4 text-muted-foreground text-sm">
              No project managers yet.
            </p>
          )}
          <SettingsRow
            label="Add manager"
            description="Assign an organization manager."
          >
            <div className="flex flex-wrap items-end gap-2">
              <SearchableCombobox
                value={managerUserId}
                onChange={setManagerUserId}
                ariaLabel="Manager"
                placeholder="Select member"
                searchPlaceholder="Search members…"
                className="w-64"
                options={orgMembers
                  .filter((m) => m.role === "manager" || m.role === "owner")
                  .map((member) => ({
                    value: member.userId,
                    label: member.name ?? member.email ?? member.userId,
                    hint: member.name ? (member.email ?? undefined) : undefined,
                  }))}
              />
              <LoadingButton
                type="button"
                size="sm"
                loading={assignManager.isPending}
                disabled={!managerUserId}
                onClick={() =>
                  assignManager.mutate({
                    projectId: project.id,
                    userId: managerUserId,
                  })
                }
              >
                Assign
              </LoadingButton>
            </div>
          </SettingsRow>
        </AccordionSection>
      </Can>

      <Can action="project.assign_team" projectId={project.id}>
        <AccordionSection
          title="Teams on project"
          description="Team members receive default project grants when linked. Direct member grants can add or change specific capabilities."
        >
          {summary?.teams.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.teams.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={removeTeam.isPending}
                        onClick={() =>
                          confirm({
                            title: `Unlink ${row.teamName}?`,
                            description:
                              "Team members will lose the default project access granted through this link. Direct member grants and project manager access stay in place.",
                            confirmLabel: "Unlink team",
                            variant: "destructive",
                            onConfirm: async () => {
                              await removeTeam.mutateAsync({
                                projectId: project.id,
                                teamId: row.teamId,
                              });
                            },
                          })
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-4 pb-4 text-muted-foreground text-sm">
              No teams linked yet.
            </p>
          )}
          <SettingsRow
            label="Link a team"
            description={
              availableTeams.length
                ? "Team members receive the default read grants for this project."
                : "Every team in this organization is already linked."
            }
          >
            <div className="flex flex-wrap items-end gap-2">
              <SearchableCombobox
                value={teamId}
                onChange={setTeamId}
                ariaLabel="Team"
                placeholder="Select team"
                searchPlaceholder="Search teams…"
                className="w-56"
                options={availableTeams.map((team) => ({
                  value: team.id,
                  label: team.name,
                }))}
              />
              <LoadingButton
                type="button"
                size="sm"
                loading={assignTeam.isPending}
                disabled={!teamId}
                onClick={() =>
                  assignTeam.mutate({ projectId: project.id, teamId })
                }
              >
                Link team
              </LoadingButton>
            </div>
          </SettingsRow>
        </AccordionSection>
      </Can>

      <Can action="project.permission.grant" projectId={project.id}>
        <AccordionSection
          title="Member grants"
          description="Per-member create/read/update/delete access on this project."
        >
          {summary?.memberGrants.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Grants</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.memberGrants.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name ?? row.email ?? row.userId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {row.grants.map(formatActionLabel).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => loadGrantsForUser(row.userId)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-4 pb-4 text-muted-foreground text-sm">
              No member grants configured yet.
            </p>
          )}
          <SettingsRow
            label="Member"
            description="Org members receive grants when on a linked team."
          >
            <SearchableCombobox
              value={grantUserId}
              onChange={(value) => loadGrantsForUser(value)}
              ariaLabel="Member"
              placeholder="Select member"
              searchPlaceholder="Search members…"
              className="w-64"
              options={orgMembers
                .filter((m) => m.role === "member")
                .map((member) => ({
                  value: member.userId,
                  label: member.name ?? member.email ?? member.userId,
                  hint: member.name ? (member.email ?? undefined) : undefined,
                }))}
            />
          </SettingsRow>
          {grantUserId ? (
            <div className="flex flex-col gap-3 px-4 pb-4">
              <p className="font-medium text-sm">Grants</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PROJECT_MEMBER_GRANT_KEYS.map((grant) => {
                  const checked = grantSelection.includes(grant);
                  return (
                    <div
                      key={grant}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        id={`project-grant-${grant}`}
                        checked={checked}
                        onCheckedChange={(next) => {
                          setGrantSelection((prev) =>
                            next
                              ? [...prev, grant]
                              : prev.filter((g) => g !== grant),
                          );
                        }}
                      />
                      <Label htmlFor={`project-grant-${grant}`}>
                        {formatActionLabel(grant)}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <LoadingButton
                type="button"
                size="sm"
                className="w-fit"
                loading={setGrants.isPending}
                onClick={() =>
                  setGrants.mutate({
                    projectId: project.id,
                    userId: grantUserId,
                    grants: grantSelection,
                  })
                }
              >
                Save grants
              </LoadingButton>
            </div>
          ) : null}
        </AccordionSection>
      </Can>
      {ConfirmDialog}
    </div>
  );
}
