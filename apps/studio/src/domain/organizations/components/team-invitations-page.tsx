"use client";

import { Button } from "@loftlancer/ui/button";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

const PAGE_SIZE = 50;
const STATUSES = [
  "pending",
  "expired",
  "accepted",
  "rejected",
  "canceled",
  "all",
] as const;
type Status = (typeof STATUSES)[number];

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
  const [status, setStatus] = useState<Status>("pending");
  const [page, setPage] = useState(0);
  const query = useQuery({
    ...trpc.organizations.listInvitations.queryOptions({
      organizationId: organization?.id ?? "",
      teamId,
      status,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    enabled: Boolean(organization?.id),
  });
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
            Invite people into this team. Accepting also joins them to the
            organization as members.
          </p>
        </div>
        <Can action="member.invite">
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            Invite to team
          </Button>
        </Can>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchableCombobox
          value={status}
          onChange={(value) => {
            setStatus(value as Status);
            setPage(0);
          }}
          ariaLabel="Filter invitations by status"
          className="w-40"
          options={STATUSES.map((value) => ({
            value,
            label: value.charAt(0).toUpperCase() + value.slice(1),
          }))}
        />
        <span className="ms-auto text-muted-foreground text-xs">
          {query.data?.total ?? 0}{" "}
          {query.data?.total === 1 ? "invitation" : "invitations"}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={(page + 1) * PAGE_SIZE >= (query.data?.total ?? 0)}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
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
          onInvited={() => void refresh()}
        />
      ) : null}
    </section>
  );
}
