"use client";

import { Button } from "@loftlancer/ui/button";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import {
  INVITATION_PAGE_SIZE,
  InvitationListControls,
  type InvitationStatusFilter,
} from "@/components/org/invitation-list-controls";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { ErrorState } from "@/components/patterns/error-state";
import { BulkInviteDialog } from "@/domain/organizations/components/bulk-invite-dialog";
import { Can } from "@/domain/permissions/components/can";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function ProjectInvitationsPage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const { activeOrganizationId } = useActiveOrganization();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [status, setStatus] = useState<InvitationStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const projectQuery = useQuery(trpc.projects.getBySlug.queryOptions({ slug }));
  const project = projectQuery.data?.data?.project;
  const invitations = useQuery({
    ...trpc.organizations.listProjectInvitations.queryOptions({
      projectId: project?.id ?? "",
      status,
      search: search.trim() || undefined,
      limit: INVITATION_PAGE_SIZE,
      offset: page * INVITATION_PAGE_SIZE,
    }),
    enabled: Boolean(project?.id),
  });
  const pendingInvitations = useQuery({
    ...trpc.organizations.listProjectInvitations.queryOptions({
      projectId: project?.id ?? "",
      status: "pending",
      limit: 200,
      offset: 0,
    }),
    enabled: Boolean(project?.id),
  });
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.organizations.listProjectInvitations.pathKey(),
    });
  };
  const cancel = useMutation(
    trpc.organizations.cancelProjectInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Project invitation revoked");
        refresh();
      },
      onError: (error) => toast.error(error.message),
      onSettled: () => setRevokingId(null),
    }),
  );
  const resend = useMutation(
    trpc.organizations.resendProjectInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Project invitation resent");
        refresh();
      },
      onError: (error) => toast.error(error.message),
      onSettled: () => setResendingId(null),
    }),
  );

  if (projectQuery.isPending) return <Skeleton className="h-40 rounded-xl" />;
  if (projectQuery.isError || !project) {
    return (
      <ErrorState
        title="Could not load project"
        description="Try loading the project again."
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">Invitations</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Invite a person to this project. Acceptance adds them to the
            organization if needed and gives default project read access.
          </p>
        </div>
        <Can action="member.invite">
          <Can action="project.permission.grant" projectId={project.id}>
            <Button type="button" size="sm" onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
          </Can>
        </Can>
      </div>
      <InvitationListControls
        status={status}
        page={page}
        total={invitations.data?.total ?? 0}
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
      {invitations.isPending ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : invitations.isError ? (
        <ErrorState
          title="Could not load project invitations"
          description="Try loading invitations again."
          onRetry={() => void invitations.refetch()}
        />
      ) : invitations.data.items.length === 0 ? (
        <EmptyState
          icon={appIcons.invite}
          title={
            status === "pending"
              ? "No pending invitations"
              : `No ${status === "all" ? "" : `${status} `}invitations`
          }
          description="Invitations for this project will appear here after you invite someone."
        />
      ) : (
        <OrganizationInvitationsTable
          caption="Project invitations"
          projectId={project.id}
          scopeLabel="Project"
          clientPagination={false}
          invitations={invitations.data.items}
          revokingId={revokingId}
          resendingId={resendingId}
          onRevoke={(invitationId) => {
            setRevokingId(invitationId);
            cancel.mutate({ projectId: project.id, invitationId });
          }}
          onResend={(row) => {
            setResendingId(row.id);
            resend.mutate({ projectId: project.id, invitationId: row.id });
          }}
        />
      )}
      {activeOrganizationId ? (
        <BulkInviteDialog
          organizationId={activeOrganizationId}
          fixedProjectId={project.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          pendingEmails={
            pendingInvitations.data?.items.map((row) => row.email) ?? []
          }
          onInvited={refresh}
        />
      ) : null}
    </section>
  );
}
