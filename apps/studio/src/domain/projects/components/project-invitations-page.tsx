"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { ErrorState } from "@/components/patterns/error-state";
import { Can } from "@/domain/permissions/components/can";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

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

export function ProjectInvitationsPage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("pending");
  const [page, setPage] = useState(0);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const projectQuery = useQuery(trpc.projects.getBySlug.queryOptions({ slug }));
  const project = projectQuery.data?.data?.project;
  const invitations = useQuery({
    ...trpc.organizations.listProjectInvitations.queryOptions({
      projectId: project?.id ?? "",
      status,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
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
      <div className="flex flex-wrap items-center gap-2">
        <SearchableCombobox
          value={status}
          onChange={(value) => {
            setStatus(value as Status);
            setPage(0);
          }}
          ariaLabel="Filter project invitations by status"
          className="w-40"
          options={STATUSES.map((value) => ({
            value,
            label: value.charAt(0).toUpperCase() + value.slice(1),
          }))}
        />
        <span className="ms-auto text-muted-foreground text-xs">
          {invitations.data?.total ?? 0}{" "}
          {invitations.data?.total === 1 ? "invitation" : "invitations"}
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
          disabled={(page + 1) * PAGE_SIZE >= (invitations.data?.total ?? 0)}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
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
