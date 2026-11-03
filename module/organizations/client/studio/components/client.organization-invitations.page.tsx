"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { invitationsEmpty } from "@/components/data-table/data-table-empty-presets";
import {
  INVITATION_PAGE_SIZE,
  InvitationListControls,
  type InvitationStatusFilter,
} from "@/components/org/invitation-list-controls";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import {
  type OrganizationInvitationRow,
  pendingOrganizationInvitations,
  sortOrganizationInvitations,
} from "@/lib/organization-invitations";
import { studioORPC } from "@/lib/orpc";
import { Can } from "@/shared/permissions/shared.permissions.can";
import { useOrganizationBySlug } from "../hooks/client.use-organization-by-slug.hook";
import {
  organizationQueryKeys,
  useOrganizationOperationMutation,
  useOrganizationOperationQuery,
} from "../hooks/client.use-organization-operation.hook";
import { BulkInviteDialog } from "./client.bulk-invite.dialog";
import { OrganizationSectionPage } from "./client.organization-section.page";

export function OrganizationInvitationsPage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const {
    organization,
    status: orgStatus,
    error,
    reload,
  } = useOrganizationBySlug(slug);
  const [status, setStatus] = useState<InvitationStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const revoke = useOrganizationOperationMutation(
    "invitation.cancel",
    (input: { invitationId: string }) =>
      studioORPC.organizations.invitationRevoke(input),
  );
  const resend = useOrganizationOperationMutation(
    "member.invite",
    (input: { invitationId: string }) =>
      studioORPC.organizations.invitationResend(input),
  );
  const invitationInput = {
    organizationId: organization?.id ?? "",
    status,
    search: search.trim() || undefined,
    limit: INVITATION_PAGE_SIZE,
    offset: page * INVITATION_PAGE_SIZE,
  };
  const listQuery = useOrganizationOperationQuery(
    "invitationList",
    invitationInput,
    () => studioORPC.organizations.invitationList(invitationInput),
    Boolean(organization?.id),
  );
  const invitations = (listQuery.data?.rows ??
    []) as OrganizationInvitationRow[];
  const counts = listQuery.data?.counts;
  const total = listQuery.data?.total ?? 0;
  const loading = listQuery.isPending;
  const loadInvitations = useCallback(
    async (_organizationId: string) =>
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all }),
    [queryClient],
  );

  const revokeInvitation = async (invitationId: string) => {
    if (!organization?.id) return;
    setRevokingId(invitationId);
    try {
      const response = await revoke.mutateAsync({ invitationId });
      if (response.status !== "success") throw new Error(response.message);
    } catch {
      // The operation hook presents the response or transport error.
    } finally {
      setRevokingId(null);
    }
  };

  const resendInvitation = async (invite: OrganizationInvitationRow) => {
    if (!organization?.id) return;
    setResendingId(invite.id);
    try {
      const response = await resend.mutateAsync({ invitationId: invite.id });
      if (response.status !== "success") throw new Error(response.message);
    } finally {
      setResendingId(null);
    }
  };

  const sorted = sortOrganizationInvitations(invitations);

  const inviteAction = (
    <Button
      type="button"
      size="sm"
      className="gap-2"
      onClick={() => setInviteOpen(true)}
    >
      <AppIcon name="invite" className="text-current" />
      Invite member
    </Button>
  );

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Invitations"
      description="Invite people as organization members, with optional team and read-only project access."
      action={<Can action="member.invite">{inviteAction}</Can>}
    >
      {orgStatus === "error" ? (
        <ErrorState
          title="Could not load organization"
          description={error?.message ?? "Try loading the organization again."}
          onRetry={() => void reload()}
        />
      ) : orgStatus === "loading" || !organization ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : listQuery.isError ||
        (listQuery.response && listQuery.response.status !== "success") ? (
        <ErrorState
          title="Could not load invitations"
          description="Try loading the invitations again."
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <InvitationListControls
            status={status}
            page={page}
            total={total}
            search={search}
            onSearchChange={(next) => {
              setSearch(next);
              setPage(0);
            }}
            onStatusChange={(next) => {
              setStatus(next);
              setPage(0);
            }}
            onPageChange={setPage}
          />
          {loading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : sorted.length === 0 && counts?.all === 0 ? (
            <Empty className="border border-dashed py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AppIcon name="mail" className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{invitationsEmpty().empty.title}</EmptyTitle>
                <EmptyDescription>
                  {invitationsEmpty().empty.description}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <OrganizationInvitationsTable
              invitations={sorted}
              empty={invitationsEmpty()}
              revokingId={revokingId}
              resendingId={resendingId}
              onRevoke={(id) => void revokeInvitation(id)}
              onResend={(invite) => void resendInvitation(invite)}
              clientPagination={false}
            />
          )}
        </div>
      )}

      {organization ? (
        <BulkInviteDialog
          organizationId={organization.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          pendingEmails={pendingOrganizationInvitations(invitations).map(
            (i) => i.email,
          )}
          onInvited={() => void loadInvitations(organization.id)}
        />
      ) : null}
    </OrganizationSectionPage>
  );
}
