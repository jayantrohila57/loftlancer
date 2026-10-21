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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useSession } from "@/domain/auth/lib/auth-actions";
import { useNotificationMutations } from "@/domain/notifications/hooks/use-notifications";
import { Can } from "@/domain/permissions/components/can";
import { authClient } from "@/lib/auth-client";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import {
  cancelOrganizationInvitation,
  type OrganizationInvitationRow,
  pendingOrganizationInvitations,
  resendOrganizationInvitation,
  sortOrganizationInvitations,
} from "@/lib/organization-invitations";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { BulkInviteDialog } from "./bulk-invite-dialog";
import { OrganizationSectionPage } from "./organization-section-page";

export function OrganizationInvitationsPage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const {
    organization,
    status: orgStatus,
    error,
    reload,
  } = useOrganizationBySlug(slug);
  const { data: session } = useSession();
  const { syncInvitationReceived } = useNotificationMutations();
  const currentUserId = session?.user?.id;
  const [status, setStatus] = useState<InvitationStatusFilter>("pending");
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const listQuery = useQuery({
    ...trpc.organizations.listInvitations.queryOptions({
      organizationId: organization?.id ?? "",
      status,
      limit: INVITATION_PAGE_SIZE,
      offset: page * INVITATION_PAGE_SIZE,
    }),
    enabled: Boolean(organization?.id),
    placeholderData: (prev) => prev,
  });
  const invitations = (listQuery.data?.rows ??
    []) as OrganizationInvitationRow[];
  const counts = listQuery.data?.counts;
  const total = listQuery.data?.total ?? 0;
  const loading = listQuery.isPending;
  const loadInvitations = useCallback(
    async (_organizationId: string) => {
      await queryClient.invalidateQueries({
        queryKey: trpc.organizations.listInvitations.pathKey(),
      });
    },
    [queryClient],
  );

  const revokeInvitation = async (invitationId: string) => {
    if (!organization?.id) return;
    setRevokingId(invitationId);
    try {
      await toast.promise(
        cancelOrganizationInvitation(authClient.organization, invitationId),
        {
          loading: "Revoking invitation…",
          success: "Invitation revoked",
          error: "Could not revoke invitation",
        },
      );
      await loadInvitations(organization.id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Revoke is not available for this workspace."
      ) {
        toast.error(error.message);
      }
    } finally {
      setRevokingId(null);
    }
  };

  const resendInvitation = async (invite: OrganizationInvitationRow) => {
    if (!organization?.id) return;
    setResendingId(invite.id);
    try {
      await toast.promise(
        resendOrganizationInvitation(authClient.organization, {
          organizationId: organization.id,
          email: invite.email,
          role: invite.role,
        }),
        {
          loading: "Resending invitation…",
          success: "Invitation resent",
          error: "Could not resend invitation",
        },
      );
      await loadInvitations(organization.id);
      if (isNotificationsEnabledOnClient() && currentUserId) {
        void syncInvitationReceived.mutate({
          organizationId: organization.id,
          email: invite.email,
        });
      }
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
      description="Pending and recent email invitations for this workspace."
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
      ) : listQuery.isError ? (
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
