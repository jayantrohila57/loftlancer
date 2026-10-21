"use client";

import { Button } from "@loftlancer/ui/button";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  INVITATION_PAGE_SIZE,
  InvitationListControls,
  type InvitationStatusFilter,
} from "@/components/org/invitation-list-controls";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { authClient } from "@/lib/auth-client";
import {
  cancelOrganizationInvitation,
  pendingOrganizationInvitations,
  toOrganizationInviteRole,
} from "@/lib/organization-invitations";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { BulkInviteDialog } from "./bulk-invite-dialog";

export function TeamInvitationsPage({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const { organization } = useOrganizationBySlug(slug);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<InvitationStatusFilter>("pending");
  const [page, setPage] = useState(0);
  const query = useQuery({
    ...trpc.organizations.listInvitations.queryOptions({
      organizationId: organization?.id ?? "",
      teamId,
      status,
      limit: INVITATION_PAGE_SIZE,
      offset: page * INVITATION_PAGE_SIZE,
    }),
    enabled: Boolean(organization?.id),
  });
  const members = useQuery(trpc.organizations.listMembers.queryOptions());
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.organizations.listInvitations.pathKey(),
    });
  const invitations = query.data?.rows ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">Invitations</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Invite someone to join this organization and team. They join as a
            team member and receive access through the team’s current project
            links. Add existing organization members from the Members tab.
          </p>
        </div>
        <Can action="member.invite">
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            Invite to team
          </Button>
        </Can>
      </div>
      <InvitationListControls
        status={status}
        page={page}
        total={query.data?.total ?? 0}
        onStatusChange={(next) => {
          setStatus(next);
          setPage(0);
        }}
        onPageChange={setPage}
      />
      {query.isPending ? (
        <Skeleton className="h-36 rounded-xl" />
      ) : query.isError ? (
        <ErrorState
          title="Could not load team invitations"
          description="Try loading invitations again."
          onRetry={() => void query.refetch()}
        />
      ) : invitations.length === 0 ? (
        <p className="rounded-xl border bg-card p-4 text-muted-foreground text-sm">
          No {status === "all" ? "" : `${status} `}invitations for this team.
        </p>
      ) : (
        <OrganizationInvitationsTable
          invitations={invitations}
          caption="Team invitations"
          scopeLabel="Team"
          revokingId={revokingId}
          resendingId={resendingId}
          onRevoke={(id) => {
            setRevokingId(id);
            void cancelOrganizationInvitation(authClient.organization, id)
              .then(() => {
                toast.success("Invitation revoked");
                return refresh();
              })
              .catch((error) => toast.error(error.message))
              .finally(() => setRevokingId(null));
          }}
          onResend={(invite) => {
            if (!organization) return;
            setResendingId(invite.id);
            void authClient.organization
              .inviteMember({
                organizationId: organization.id,
                ...(teamId ? { teamId } : {}),
                email: invite.email,
                role: toOrganizationInviteRole(invite.role),
                resend: true,
              })
              .then((result) => {
                if (result.error) {
                  throw new Error(result.error.message ?? "Could not resend");
                }
                toast.success("Invitation resent");
                return refresh();
              })
              .catch((error) => toast.error(error.message))
              .finally(() => setResendingId(null));
          }}
          clientPagination={false}
        />
      )}
      {organization ? (
        <BulkInviteDialog
          organizationId={organization.id}
          fixedTeamId={teamId}
          open={open}
          onOpenChange={setOpen}
          pendingEmails={pendingOrganizationInvitations(invitations).map(
            (invite) => invite.email,
          )}
          memberEmails={members.data?.items.map((member) => member.email) ?? []}
          onInvited={() => void refresh()}
        />
      ) : null}
    </section>
  );
}
