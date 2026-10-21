"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  INVITATION_PAGE_SIZE,
  InvitationListControls,
  type InvitationStatusFilter,
} from "@/components/org/invitation-list-controls";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function ProjectInvitationsPage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<InvitationStatusFilter>("pending");
  const [page, setPage] = useState(0);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const projectQuery = useQuery(trpc.projects.getBySlug.queryOptions({ slug }));
  const project = projectQuery.data?.data?.project;
  const invitations = useQuery({
    ...trpc.organizations.listProjectInvitations.queryOptions({
      projectId: project?.id ?? "",
      status,
      limit: INVITATION_PAGE_SIZE,
      offset: page * INVITATION_PAGE_SIZE,
    }),
    enabled: Boolean(project?.id),
  });
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.organizations.listProjectInvitations.pathKey(),
    });
  };
  const invite = useMutation(
    trpc.organizations.inviteToProject.mutationOptions({
      onSuccess: () => {
        setEmail("");
        toast.success("Project invitation sent");
        refresh();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
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
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Invitations</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Invite a person to this project. Acceptance adds them to the
          organization if needed and gives default project read access.
        </p>
      </div>
      <Can action="member.invite">
        <Can action="project.permission.grant" projectId={project.id}>
          <form
            className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim()) {
                invite.mutate({ projectId: project.id, email: email.trim() });
              }
            }}
          >
            <label
              htmlFor="project-invite-email"
              className="w-full font-medium text-sm"
            >
              Email address
            </label>
            <Input
              id="project-invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@example.com"
              className="max-w-sm"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={invite.isPending || !email.trim()}
            >
              Send invitation
            </Button>
          </form>
        </Can>
      </Can>
      <InvitationListControls
        status={status}
        page={page}
        total={invitations.data?.total ?? 0}
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
        <p className="rounded-xl border bg-card p-4 text-muted-foreground text-sm">
          No {status === "all" ? "" : `${status} `}invitations for this project.
        </p>
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
    </section>
  );
}
