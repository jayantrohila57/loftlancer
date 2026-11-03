"use client";

import { DataTableActionsColumnHeader } from "@features/data-table/core/client/data-table.actions-column";
import { DataTableColumnHeader } from "@features/data-table/core/client/data-table.column-header";
import { DataTableRowActions } from "@features/data-table/core/client/data-table.row-actions";
import type { DataTableColumnDef } from "@features/data-table/core/client/data-table.table";
import { DataTable } from "@features/data-table/core/client/data-table.table";
import { LocalDateTime } from "@features/patterns/core/client/patterns.local-date-time";
import { PageStatusError as ErrorState } from "@features/patterns/core/client/patterns.page-state";
import { SearchableCombobox } from "@features/patterns/core/client/patterns.searchable-combobox";
import { Button } from "@loftlancer/ui/button";
import type { useTeamMembersScreen } from "../hooks/client.use-teams-members-screen.hook";
import { Can } from "./client.can";

export function TeamMembersContent({
  teamId,
  state,
}: {
  teamId: string;
  state: ReturnType<typeof useTeamMembersScreen>;
}) {
  const {
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
  } = state;
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
          <span className="text-muted-foreground block truncate text-xs">
            {row.original.email}
          </span>
          {row.original.createdAt ? (
            <span className="text-muted-foreground block truncate text-xs">
              Joined{" "}
              <LocalDateTime
                value={String(row.original.createdAt)}
                showTimeOnHover
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
    <>
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
              <div className="bg-card flex flex-wrap items-end gap-2 rounded-xl border p-4">
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
    </>
  );
}
