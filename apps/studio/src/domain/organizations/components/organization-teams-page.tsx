"use client";

import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Input } from "@loftlancer/ui/input";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import { GuardedDialog } from "@/components/patterns/guarded-dialog";
import { Can } from "@/domain/permissions/components/can";
import { useConfirm } from "@/hooks/use-confirm";
import { isTeamCreateFormDirty } from "@/lib/form-dirty";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";
import { TeamMembersSheet } from "./team-members-sheet";

type TeamRow = { id: string; name: string; memberCount?: number };

export function OrganizationTeamsPage({
  slug,
  selectedTeamId,
}: {
  slug: string;
  selectedTeamId?: string;
}) {
  const { organization, status: orgStatus } = useOrganizationBySlug(slug);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [membersTeam, setMembersTeam] = useState<TeamRow | null>(null);
  const [renameTeam, setRenameTeam] = useState<TeamRow | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: Boolean(organization?.id),
  });

  const invalidateTeams = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.list.queryKey(),
    });
  };

  const createMutation = useMutation(
    trpc.teams.create.mutationOptions({
      onSuccess: () => {
        toast.success("Team created");
        setTeamName("");
        closeWithoutPromptRef.current?.();
        setCreateOpen(false);
        invalidateTeams();
      },
      onError: () => toast.error("Could not create team"),
    }),
  );

  const updateMutation = useMutation(
    trpc.teams.update.mutationOptions({
      onSuccess: () => {
        toast.success("Team renamed");
        setRenameTeam(null);
        invalidateTeams();
      },
      onError: () => toast.error("Could not rename team"),
    }),
  );

  const deleteMutation = useMutation(
    trpc.teams.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Team deleted");
        invalidateTeams();
      },
      onError: () => toast.error("Could not delete team"),
    }),
  );

  const teams = teamsQuery.data?.items ?? [];
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);
  const requestedTeamId = selectedTeamId ?? searchParams.get("team");
  const teamProjectsQuery = useQuery({
    ...trpc.teams.projects.queryOptions({ teamId: selectedTeamId ?? "" }),
    enabled: Boolean(selectedTeamId && selectedTeam),
  });

  useEffect(() => {
    if (selectedTeamId || !requestedTeamId || teamsQuery.isPending) return;
    const legacyTeam = teams.find((item) => item.id === requestedTeamId);
    if (legacyTeam) setMembersTeam(legacyTeam);
  }, [requestedTeamId, selectedTeamId, teams, teamsQuery.isPending]);

  const closeMembers = () => {
    setMembersTeam(null);
    if (selectedTeamId) return;
    if (!requestedTeamId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("team");
    const query = params.toString();
    router.replace(
      `${routes.orgSection(slug, "teams")}${query ? `?${query}` : ""}`,
      { scroll: false },
    );
  };
  const { confirm, ConfirmDialog: confirmOutlet } = useConfirm();

  return (
    <OrganizationSectionPage
      slug={slug}
      title={selectedTeam?.name ?? "Teams"}
      description={
        selectedTeam
          ? `Team members and project access in ${organization?.name ?? slug}.`
          : "Group members into teams within this organization."
      }
      action={
        selectedTeam ? (
          <Can action="team.member.add">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMembersTeam(selectedTeam)}
            >
              Manage members
            </Button>
          </Can>
        ) : organization ? (
          <Can action="team.create">
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <AppIcon name="plus" className="text-current" />
              New team
            </Button>
          </Can>
        ) : undefined
      }
    >
      {selectedTeam ? (
        <div className="space-y-4">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-medium text-sm">Team access</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {selectedTeam.memberCount ?? 0} members. Team membership can grant
              access to linked projects; project-specific grants may also apply.
            </p>
          </section>
          <section className="space-y-3">
            <div>
              <h2 className="font-medium text-sm">Linked projects</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Projects this team can access and that you are allowed to view.
              </p>
            </div>
            {teamProjectsQuery.isPending ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : teamProjectsQuery.isError ? (
              <ErrorState
                title="Could not load linked projects"
                description="Project access could not be loaded for this team."
                onRetry={() => void teamProjectsQuery.refetch()}
              />
            ) : teamProjectsQuery.data.items.length === 0 ? (
              <EmptyState
                icon={appIcons.project}
                title="No projects linked"
                description="Link this team from a project’s Access settings to give the team project access."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teamProjectsQuery.data.items.map((project) => (
                  <Link
                    key={project.id}
                    href={routes.project(slug, project.slug)}
                    className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-medium text-sm">{project.name}</span>
                    <span className="mt-1 block truncate text-muted-foreground text-xs">
                      {project.slug}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : orgStatus === "loading" ||
        !organization ||
        teamsQuery.isLoading ||
        teams.length > 0 ? (
        <DataTable
          framed
          searchable
          enablePagination
          pageSize={20}
          searchPlaceholder="Search teams…"
          isLoading={
            orgStatus === "loading" || !organization || teamsQuery.isLoading
          }
          isError={teamsQuery.isError}
          skeletonRowCount={3}
          data={teams}
          columns={[
            {
              accessorKey: "name",
              header: "Name",
              cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
              ),
            },
            {
              id: "actions",
              header: () => <DataTableActionsColumnHeader />,
              cell: ({ row }) => {
                const team = row.original;
                return (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(routes.team(slug, team.id))}
                    >
                      Open team
                    </Button>
                    <Can action="team.update">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRenameTeam(team);
                          setRenameValue(team.name);
                        }}
                      >
                        Rename
                      </Button>
                    </Can>
                    <Can action="team.delete">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          confirm({
                            title: `Delete ${team.name}?`,
                            description:
                              "Members stay in the organization but lose any project access granted through this team. This can't be undone.",
                            confirmLabel: "Delete team",
                            variant: "destructive",
                            onConfirm: async () => {
                              // onError already toasts; keep the dialog flow quiet.
                              await deleteMutation
                                .mutateAsync({ teamId: team.id })
                                .catch(() => undefined);
                            },
                          })
                        }
                      >
                        Delete
                      </Button>
                    </Can>
                  </div>
                );
              },
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={appIcons.member}
          title="No teams yet"
          description="Create a team to organize members and project access."
          actionLabel="New team"
          onAction={() => setCreateOpen(true)}
        />
      )}
      {selectedTeamId &&
      !teamsQuery.isPending &&
      !teamsQuery.isError &&
      !teams.some((team) => team.id === selectedTeamId)
        ? notFound()
        : null}

      <GuardedDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isDirty={isTeamCreateFormDirty(teamName)}
        onDiscard={() => setTeamName("")}
        closeWithoutPromptRef={closeWithoutPromptRef}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
          </DialogHeader>
          <FormField id="team-name" label="Team name" required>
            <Input
              id="team-name"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Platform"
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createMutation.isPending || !teamName.trim()}
              onClick={() => createMutation.mutate({ name: teamName.trim() })}
            >
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </GuardedDialog>

      <GuardedDialog
        open={Boolean(renameTeam)}
        onOpenChange={(open) => {
          if (!open) setRenameTeam(null);
        }}
        isDirty={Boolean(renameTeam && renameValue !== renameTeam.name)}
        onDiscard={() => setRenameValue(renameTeam?.name ?? "")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename team</DialogTitle>
          </DialogHeader>
          <FormField id="team-rename" label="Team name" required>
            <Input
              id="team-rename"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRenameTeam(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !renameTeam || updateMutation.isPending || !renameValue.trim()
              }
              onClick={() => {
                if (!renameTeam) return;
                updateMutation.mutate({
                  teamId: renameTeam.id,
                  name: renameValue.trim(),
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </GuardedDialog>

      {organization && membersTeam ? (
        <TeamMembersSheet
          organizationId={organization.id}
          team={membersTeam}
          open={Boolean(membersTeam)}
          onOpenChange={(open) => {
            if (!open) closeMembers();
          }}
        />
      ) : null}
      {confirmOutlet}
    </OrganizationSectionPage>
  );
}
