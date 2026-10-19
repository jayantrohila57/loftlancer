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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
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

type TeamRow = { id: string; name: string };

export function OrganizationTeamsPage({ slug }: { slug: string }) {
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
  const sidebarTeamId = searchParams.get("team");

  useEffect(() => {
    if (!sidebarTeamId || teamsQuery.isPending) return;
    const team = teams.find((item) => item.id === sidebarTeamId);
    if (team) setMembersTeam(team);
  }, [sidebarTeamId, teams, teamsQuery.isPending]);

  const closeMembers = () => {
    setMembersTeam(null);
    if (!sidebarTeamId) return;
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
      title="Teams"
      description="Group members into teams within this organization."
      action={
        organization ? (
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
      {orgStatus === "loading" ||
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
                      onClick={() => setMembersTeam(team)}
                    >
                      Members
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
