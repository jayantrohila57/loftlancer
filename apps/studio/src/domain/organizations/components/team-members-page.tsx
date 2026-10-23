"use client";

import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function TeamMembersPage({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [userId, setUserId] = useState("");
  const members = useQuery(trpc.teams.members.queryOptions({ teamId }));
  const canAddMembers = useCan("team.member.add", { teamId });
  const canChangeRoles = useCan("team.member.role.change", { teamId });
  const availableMembers = useQuery({
    ...trpc.teams.availableMembers.queryOptions({ teamId }),
    enabled: canAddMembers.allowed,
  });
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.members.queryKey({ teamId }),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.list.queryKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.permissions.snapshot.queryKey({}),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.permissions.snapshot.queryKey({ teamId }),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.projectAccess.getSummary.pathKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.teams.availableMembers.queryKey({ teamId }),
    });
  };
  const add = useMutation(
    trpc.teams.addMember.mutationOptions({
      onSuccess: () => {
        setUserId("");
        toast.success("Member added to team");
        refresh();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.teams.removeMember.mutationOptions({
      onSuccess: () => {
        toast.success("Member removed from team");
        refresh();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const changeRole = useMutation(
    trpc.teams.updateMemberRole.mutationOptions({
      onSuccess: () => {
        toast.success("Team role updated");
        refresh();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const addable = availableMembers.data?.items ?? [];
  const memberRows = (members.data?.items ?? []).map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.name || row.email || row.userId,
    email: row.email ?? "",
    role: row.role,
    createdAt: row.createdAt,
    addedByName: row.addedByName,
    updatedAt: row.updatedAt,
    updatedByName: row.updatedByName,
  }));
  const columns: DataTableColumnDef<(typeof memberRows)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="block truncate font-medium">
            {row.original.name}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {row.original.email}
          </span>
          {row.original.createdAt ? (
            <span className="block truncate text-muted-foreground text-xs">
              Joined{" "}
              <LocalDateTime
                value={String(row.original.createdAt)}
                options={LOCAL_DATE_TIME_FORMAT}
              />
              {row.original.addedByName
                ? ` · Added by ${row.original.addedByName}`
                : ""}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Team role",
      cell: ({ row }) => (row.original.role === "lead" ? "Lead" : "Member"),
    },
    {
      id: "actions",
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => (
        <Can action="team.member.remove" teamId={teamId} fallback={null}>
          <DataTableRowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              ...(canChangeRoles.allowed
                ? [
                    {
                      label:
                        row.original.role === "lead"
                          ? "Make team member"
                          : "Make team lead",
                      disabled: changeRole.isPending,
                      onSelect: () =>
                        confirm({
                          title:
                            row.original.role === "lead"
                              ? `Remove lead role from ${row.original.name}?`
                              : `Make ${row.original.name} a team lead?`,
                          description:
                            "Team leads can add and remove members in this team. They cannot change organization settings, project access, or team roles.",
                          confirmLabel:
                            row.original.role === "lead"
                              ? "Make team member"
                              : "Make team lead",
                          onConfirm: async () => {
                            await changeRole.mutateAsync({
                              teamId,
                              userId: row.original.userId,
                              role:
                                row.original.role === "lead"
                                  ? "member"
                                  : "lead",
                            });
                          },
                        }),
                    },
                  ]
                : []),
              {
                label: "Remove from team",
                destructive: true,
                disabled: remove.isPending,
                onSelect: () =>
                  confirm({
                    title: `Remove ${row.original.name} from the team?`,
                    description:
                      "They will remain in the organization, but may lose access through this team. Individual project access settings stay saved and apply while at least one team has access.",
                    confirmLabel: "Remove from team",
                    variant: "destructive",
                    onConfirm: async () => {
                      await remove.mutateAsync({
                        teamId,
                        userId: row.original.userId,
                      });
                    },
                  }),
              },
            ]}
          />
        </Can>
      ),
    },
  ];

  return (
    <section className="min-w-0 space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Members</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Add existing organization members here. Members gain access to
          projects assigned to this team based on each project’s access rules.
          Use Team invitations for people who have not joined the organization
          yet.
        </p>
      </div>
      {members.isError || availableMembers.isError ? (
        <ErrorState
          title="Could not load team members"
          description="Try loading members again."
          onRetry={() => {
            void members.refetch();
            void availableMembers.refetch();
          }}
        />
      ) : (
        <>
          <Can action="team.member.add" teamId={teamId} fallback={null}>
            {addable.length > 0 ? (
              <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4">
                <SearchableCombobox
                  value={userId}
                  onChange={setUserId}
                  ariaLabel="Organization member to add"
                  placeholder="Select a member"
                  searchPlaceholder="Search members…"
                  className="w-full sm:w-64"
                  options={addable.map((row) => ({
                    value: row.userId,
                    label: row.name || row.email,
                    hint: row.email,
                  }))}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!userId || add.isPending}
                  onClick={() => add.mutate({ teamId, userId })}
                >
                  Add member
                </Button>
              </div>
            ) : null}
          </Can>
          <DataTable
            columns={columns}
            data={memberRows}
            isLoading={
              members.isPending ||
              (canAddMembers.allowed && availableMembers.isPending)
            }
            searchable
            enablePagination
            pageSize={10}
            framed
            compactLayout
            caption="Team members"
            captionSrOnly
            searchPlaceholder="Search members…"
            emptyMessage="This team has no members yet."
          />
        </>
      )}
      {ConfirmDialog}
    </section>
  );
}
