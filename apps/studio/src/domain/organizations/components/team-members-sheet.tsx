"use client";

import { Button } from "@loftlancer/ui/button";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { SheetDescription } from "@loftlancer/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@loftlancer/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { authClient, MEMBER_PAGE_LIMIT } from "@/lib/auth-client";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type OrgMemberRow = {
  id: string;
  user: { id?: string; name: string; email: string };
};

type TeamMemberRow = {
  id: string;
  userId: string;
  teamId: string;
};

type TeamMembersSheetProps = {
  organizationId: string;
  team: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TeamMembersSheet({
  organizationId,
  team,
  open,
  onOpenChange,
}: TeamMembersSheetProps) {
  const { allowed: canAdd } = useCan("team.member.add");
  const { allowed: canRemove } = useCan("team.member.remove");

  const queryClient = useQueryClient();
  const [addUserId, setAddUserId] = useState("");
  const [addPending, setAddPending] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setAddUserId("");
  }, [open]);

  const teamMembersQueryOptions = trpc.teams.members.queryOptions(
    { teamId: team.id },
    { enabled: open, retry: false, refetchOnWindowFocus: false },
  );
  const teamMembersQuery = useQuery(teamMembersQueryOptions);
  const addMemberMutation = useMutation(trpc.teams.addMember.mutationOptions());
  const removeMemberMutation = useMutation(
    trpc.teams.removeMember.mutationOptions(),
  );
  const orgMembersQuery = useQuery({
    queryKey: ["team-members-sheet", "org-members", organizationId],
    enabled: open,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const list = await authClient.organization.listMembers({
        query: { organizationId, limit: MEMBER_PAGE_LIMIT },
      });
      if (list.error) {
        throw new Error(list.error.message ?? "Could not load members");
      }
      return (list.data?.members ?? []) as OrgMemberRow[];
    },
  });

  const loading = teamMembersQuery.isPending || orgMembersQuery.isPending;
  const loadError = teamMembersQuery.error ?? orgMembersQuery.error;
  const orgMembers = orgMembersQuery.data ?? [];
  const teamMembers: TeamMemberRow[] = teamMembersQuery.data?.items ?? [];

  const loadMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: teamMembersQueryOptions.queryKey,
    });
  };

  const memberByUserId = new Map(
    orgMembers
      .map((row) => {
        const userId = row.user.id ?? row.id;
        return [userId, row.user] as const;
      })
      .filter(([userId]) => Boolean(userId)),
  );

  const teamUserIds = new Set(teamMembers.map((m) => m.userId));
  const addableMembers = orgMembers.filter((row) => {
    const userId = row.user.id ?? row.id;
    return userId && !teamUserIds.has(userId);
  });

  const handleAdd = async () => {
    if (!addUserId) return;
    setAddPending(true);
    try {
      await toast.promise(
        addMemberMutation.mutateAsync({ teamId: team.id, userId: addUserId }),
        {
          loading: "Adding member…",
          success: "Member added to team",
          error: "Could not add team member",
        },
      );
      setAddUserId("");
      await loadMembers();
    } finally {
      setAddPending(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await toast.promise(
        removeMemberMutation.mutateAsync({ teamId: team.id, userId }),
        {
          loading: "Removing member…",
          success: "Member removed from team",
          error: "Could not remove team member",
        },
      );
      await loadMembers();
    } finally {
      setRemovingUserId(null);
    }
  };

  const isDirty = addUserId.length > 0;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      onDiscard={() => setAddUserId("")}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="member">
            {team.name} members
          </SheetTitleWithIcon>
          <SheetDescription>
            Add or remove organization members on this team.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetBody>
          {loading ? (
            <SettingsPanelSkeleton rows={3} />
          ) : (
            <div className="flex flex-col gap-6">
              {loadError ? (
                <ErrorState
                  title="Could not load team members"
                  description={loadError.message}
                  onRetry={() => {
                    void teamMembersQuery.refetch();
                    void orgMembersQuery.refetch();
                  }}
                />
              ) : teamMembers.length === 0 ? (
                <EmptyState
                  icon={appIcons.member}
                  title="No members yet"
                  description="Add organization members to this team."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      {canRemove ? (
                        <TableHead className="w-[100px] text-right">
                          Actions
                        </TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => {
                      const user = memberByUserId.get(member.userId);
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {user?.name ?? "Member"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user?.email ?? member.userId}
                          </TableCell>
                          {canRemove ? (
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={removingUserId === member.userId}
                                onClick={() => void handleRemove(member.userId)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {!loadError && canAdd && addableMembers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <FormField id="team-add-member" label="Add member">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <SearchableCombobox
                        id="team-add-member"
                        value={addUserId}
                        onChange={setAddUserId}
                        ariaLabel="Add member"
                        placeholder="Select a member"
                        searchPlaceholder="Search members…"
                        className="flex-1"
                        options={addableMembers.map((row) => ({
                          value: row.user.id ?? row.id,
                          label: row.user.name || row.user.email,
                          hint: row.user.email,
                        }))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="shrink-0 gap-2"
                        disabled={addPending || !addUserId}
                        onClick={() => void handleAdd()}
                      >
                        <AppIcon name="plus" className="text-current" />
                        Add
                      </Button>
                    </div>
                  </FormField>
                </div>
              ) : null}
            </div>
          )}
        </FormSheetBody>
      </FormSheetPopup>
    </FormSheet>
  );
}
