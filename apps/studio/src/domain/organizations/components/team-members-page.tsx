"use client";

import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function TeamMembersPage({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [userId, setUserId] = useState("");
  const members = useQuery(trpc.teams.members.queryOptions({ teamId }));
  const orgMembers = useQuery(trpc.organizations.listMembers.queryOptions());
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
  const teamUserIds = new Set(
    members.data?.items.map((row) => row.userId) ?? [],
  );
  const allMembers = orgMembers.data?.items ?? [];
  const addable = allMembers.filter((row) => !teamUserIds.has(row.userId));
  const memberById = new Map(allMembers.map((row) => [row.userId, row]));
  const memberRows = (members.data?.items ?? []).map((row) => {
    const person = memberById.get(row.userId);
    return {
      id: row.id,
      userId: row.userId,
      name: person?.name || person?.email || row.userId,
      email: person?.email ?? "",
    };
  });
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
        </div>
      ),
    },
    {
      id: "actions",
      meta: { role: "actions" },
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => (
        <Can action="team.member.remove">
          <DataTableRowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              {
                label: "Remove from team",
                destructive: true,
                disabled: remove.isPending,
                onSelect: () =>
                  confirm({
                    title: `Remove ${row.original.name} from the team?`,
                    description:
                      "They will remain in the organization, but may lose project access they get through this team. Direct project access stays in place.",
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
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Members</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Add existing organization members here. Use Team invitations to invite
          someone who has not joined the organization yet.
        </p>
      </div>
      {members.isError || orgMembers.isError ? (
        <ErrorState
          title="Could not load team members"
          description="Try loading members again."
          onRetry={() => {
            void members.refetch();
            void orgMembers.refetch();
          }}
        />
      ) : (
        <>
          <Can action="team.member.add">
            {addable.length > 0 ? (
              <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4">
                <SearchableCombobox
                  value={userId}
                  onChange={setUserId}
                  ariaLabel="Organization member to add"
                  placeholder="Select a member"
                  searchPlaceholder="Search members…"
                  className="w-64"
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
            isLoading={members.isPending || orgMembers.isPending}
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
