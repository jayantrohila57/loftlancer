"use client";

import { Button } from "@loftlancer/ui/button";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Members</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Add existing organization members here. Use Team invitations to invite
          someone who has not joined the organization yet.
        </p>
      </div>
      {members.isPending || orgMembers.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : members.isError || orgMembers.isError ? (
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
          {members.data.items.length === 0 ? (
            <p className="rounded-xl border bg-card p-4 text-muted-foreground text-sm">
              This team has no members yet.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {members.data.items.map((row) => {
                const person = memberById.get(row.userId);
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {person?.name || person?.email || row.userId}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        {person?.email}
                      </p>
                    </div>
                    <Can action="team.member.remove">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={remove.isPending}
                        onClick={() =>
                          confirm({
                            title: `Remove ${person?.name || person?.email || "this member"} from the team?`,
                            description:
                              "They will remain in the organization, but may lose project access they get through this team. Direct project access stays in place.",
                            confirmLabel: "Remove from team",
                            variant: "destructive",
                            onConfirm: async () => {
                              await remove.mutateAsync({
                                teamId,
                                userId: row.userId,
                              });
                            },
                          })
                        }
                      >
                        Remove
                      </Button>
                    </Can>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      {ConfirmDialog}
    </section>
  );
}
