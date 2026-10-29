"use client";

import { formatActionLabel, normalizeOrgRole } from "@loftlancer/actions";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { Can } from "@/shared/permissions/shared.permissions.can";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function OrganizationMemberProfiles({
  memberId,
  organizationSlug,
  onClose,
}: {
  memberId: string;
  organizationSlug: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const members = useQuery(trpc.organizations.listMembers.queryOptions());
  const access = useQuery(
    trpc.organizations.getMemberAccessSummary.queryOptions({ memberId }),
  );
  const profilePermission = useCan("member.profile.update");
  const [drafts, setDrafts] = useState<
    Record<string, { jobTitle: string; department: string }>
  >({});
  const { confirm, ConfirmDialog } = useConfirm();
  const update = useMutation(
    trpc.organizations.updateMemberProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Member profile updated");
        void client.invalidateQueries({
          queryKey: trpc.organizations.listMembers.queryKey(),
        });
        void client.invalidateQueries({
          queryKey: trpc.organizations.getMemberAccessSummary.queryKey({
            memberId,
          }),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const suspension = useMutation(
    trpc.organizations.setMemberSuspended.mutationOptions({
      onSuccess: () => {
        toast.success("Member access updated");
        void client.invalidateQueries({
          queryKey: trpc.organizations.listMembers.queryKey(),
        });
        void client.invalidateQueries({
          queryKey: trpc.organizations.listCustomRoles.queryKey(),
        });
        void client.invalidateQueries({
          queryKey: trpc.organizations.getMemberAccessSummary.queryKey({
            memberId,
          }),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <>
      <AccordionSection
        title="Member details and access"
        description="Organization-specific details and temporary access controls. Suspended members lose access only to this organization."
      >
        <div className="mb-3 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close details
          </Button>
        </div>
        {members.isError ? (
          <p role="alert" className="text-destructive text-sm">
            Could not load members: {members.error.message}
          </p>
        ) : null}
        {members.data?.items.length ? (
          members.data.items.some((member) => member.id === memberId) ? (
            <ul className="divide-y">
              {members.data.items
                .filter((member) => member.id === memberId)
                .map((member) => {
                  const draft = drafts[member.id] ?? {
                    jobTitle: member.jobTitle ?? "",
                    department: member.department ?? "",
                  };
                  const normalizedRole = normalizeOrgRole(member.role);
                  const owner = normalizedRole === "owner";
                  return (
                    <li key={member.id} className="flex flex-col gap-3 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {member.name || member.email}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {member.email} ·{" "}
                            {owner
                              ? "Owner"
                              : member.suspendedAt
                                ? "Suspended"
                                : "Active"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {member.joinedAt ? (
                              <>
                                Joined{" "}
                                <LocalDateTime
                                  value={String(member.joinedAt)}
                                  options={LOCAL_DATE_TIME_FORMAT}
                                />
                              </>
                            ) : null}
                            {member.invitedByName || member.invitedByEmail
                              ? ` · Invited by ${member.invitedByName || member.invitedByEmail}`
                              : ""}
                          </p>
                          {member.updatedAt ? (
                            <p className="text-muted-foreground text-xs">
                              Updated{" "}
                              <LocalDateTime
                                value={String(member.updatedAt)}
                                options={LOCAL_DATE_TIME_FORMAT}
                              />
                              {member.updatedByName
                                ? ` by ${member.updatedByName}`
                                : ""}
                            </p>
                          ) : null}
                        </div>
                        {!owner ? (
                          <Can action="member.suspend">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={suspension.isPending}
                              onClick={() => {
                                const suspended = !member.suspendedAt;
                                if (suspended)
                                  confirm({
                                    title: `Suspend ${member.name || member.email}?`,
                                    description:
                                      "They will immediately lose access to this organization and its teams, projects, and apps. Other organizations are unaffected.",
                                    confirmLabel: "Suspend access",
                                    variant: "destructive",
                                    onConfirm: async () => {
                                      await suspension.mutateAsync({
                                        memberId: member.id,
                                        suspended,
                                        reason:
                                          "Suspended by an organization owner",
                                      });
                                    },
                                  });
                                else
                                  suspension.mutate({
                                    memberId: member.id,
                                    suspended,
                                  });
                              }}
                            >
                              {member.suspendedAt
                                ? "Reactivate access"
                                : "Suspend access"}
                            </Button>
                          </Can>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          aria-label={`Job title for ${member.name || member.email}`}
                          placeholder="Job title"
                          value={draft.jobTitle}
                          disabled={
                            !profilePermission.allowed ||
                            Boolean(member.suspendedAt)
                          }
                          onChange={(event) =>
                            setDrafts((old) => ({
                              ...old,
                              [member.id]: {
                                ...draft,
                                jobTitle: event.target.value,
                              },
                            }))
                          }
                          maxLength={100}
                        />
                        <Input
                          aria-label={`Department for ${member.name || member.email}`}
                          placeholder="Department"
                          value={draft.department}
                          disabled={
                            !profilePermission.allowed ||
                            Boolean(member.suspendedAt)
                          }
                          onChange={(event) =>
                            setDrafts((old) => ({
                              ...old,
                              [member.id]: {
                                ...draft,
                                department: event.target.value,
                              },
                            }))
                          }
                          maxLength={100}
                        />
                        <Can action="member.profile.update">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              update.isPending ||
                              Boolean(member.suspendedAt) ||
                              (draft.jobTitle === (member.jobTitle ?? "") &&
                                draft.department === (member.department ?? ""))
                            }
                            onClick={() =>
                              update.mutate({
                                memberId: member.id,
                                jobTitle: draft.jobTitle || null,
                                department: draft.department || null,
                              })
                            }
                          >
                            Save details
                          </Button>
                        </Can>
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">
                          Access details
                        </summary>
                        <div className="mt-2 space-y-1 rounded-md bg-muted/40 p-3">
                          <p>
                            Base role:{" "}
                            <span className="font-medium">
                              {normalizedRole}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Project and app access follows project and team
                            assignments.
                          </p>
                          {member.suspendedAt ? (
                            <p className="text-muted-foreground">
                              Suspended:{" "}
                              {member.suspensionReason || "No reason recorded"}
                            </p>
                          ) : null}
                        </div>
                      </details>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              Member details are no longer available.
            </p>
          )
        ) : members.isSuccess ? (
          <p className="text-muted-foreground text-sm">
            Member details are no longer available.
          </p>
        ) : null}
      </AccordionSection>
      {access.isPending ? (
        <AccordionSection title="Access across this organization">
          <p className="text-muted-foreground text-sm">
            Loading current access…
          </p>
        </AccordionSection>
      ) : access.isError ? (
        <AccordionSection title="Access across this organization">
          <ErrorState
            title="Could not load member access"
            description="Try loading the access summary again."
            onRetry={() => void access.refetch()}
          />
        </AccordionSection>
      ) : access.data ? (
        <>
          <AccordionSection
            title="Organization access"
            description="The member’s organization role and permissions."
          >
            <p className="font-medium capitalize">
              {access.data.member.role ?? "No organization role"}
              {access.data.member.customRole
                ? ` · ${access.data.member.customRole}`
                : ""}
            </p>
            {access.data.member.suspended ? (
              <p className="mt-2 text-destructive text-sm">
                Access is suspended. Team, project, and app access is inactive.
                {access.data.member.suspensionReason
                  ? ` ${access.data.member.suspensionReason}`
                  : ""}
              </p>
            ) : null}
            <p className="mt-2 text-muted-foreground text-sm">
              {access.data.member.organizationActions.length
                ? access.data.member.organizationActions.join(" · ")
                : "No additional organization permissions."}
            </p>
          </AccordionSection>
          <AccordionSection
            title="Teams"
            description="Team membership is one way project access is inherited."
          >
            {access.data.teams.length ? (
              <ul className="divide-y">
                {access.data.teams.map((team) => (
                  <li
                    key={team.id}
                    className="flex flex-wrap justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {team.role}
                      </p>
                    </div>
                    <Link
                      className="text-primary text-sm underline-offset-4 hover:underline"
                      href={routes.teamSection(
                        organizationSlug,
                        team.id,
                        "members",
                      )}
                    >
                      Manage team
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No active team memberships.
              </p>
            )}
          </AccordionSection>
          <AccordionSection
            title="Projects"
            description="Access sources and effective permissions for projects you can view."
          >
            {access.data.projects.length ? (
              <ul className="divide-y">
                {access.data.projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-muted-foreground text-sm">
                        Access through:{" "}
                        {project.sources.join(", ") || "Organization role"}
                      </p>
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          Effective permissions
                        </summary>
                        <p className="mt-1 text-muted-foreground">
                          {project.permissions.join(" · ")}
                        </p>
                      </details>
                    </div>
                    <Link
                      className="shrink-0 text-primary text-sm underline-offset-4 hover:underline"
                      href={routes.projectSection(
                        organizationSlug,
                        project.slug,
                        "access",
                      )}
                    >
                      Manage project access
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No accessible projects are visible to you.
              </p>
            )}
          </AccordionSection>
          <AccordionSection
            title="Applications"
            description="Applications inherit project access unless a project restricts access."
          >
            {access.data.apps.length ? (
              <ul className="divide-y">
                {access.data.apps.map((app) => (
                  <li
                    key={`${app.projectId}:${app.id}`}
                    className="flex flex-wrap justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {app.projectName} ·{" "}
                        {app.sources.join(", ") || "Project access"}
                      </p>
                    </div>
                    <Link
                      className="text-primary text-sm underline-offset-4 hover:underline"
                      href={routes.app(
                        organizationSlug,
                        app.projectSlug,
                        app.id,
                      )}
                    >
                      Open application
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No application access is visible to you.
              </p>
            )}
          </AccordionSection>
          <AccordionSection
            title="Activity"
            description="Recent audit events performed by this member."
          >
            {access.data.activity === null ? (
              <p className="text-muted-foreground text-sm">
                Activity is unavailable to your role or is not enabled.
              </p>
            ) : access.data.activity.length ? (
              <ul className="divide-y">
                {access.data.activity.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap justify-between gap-2 py-2 text-sm"
                  >
                    <span>
                      {formatActionLabel(event.action)} ·{" "}
                      {event.entityType.replaceAll("_", " ")} · {event.result}
                    </span>
                    <LocalDateTime
                      value={String(event.createdAt)}
                      options={LOCAL_DATE_TIME_FORMAT}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No recent activity recorded.
              </p>
            )}
          </AccordionSection>
        </>
      ) : null}
      {ConfirmDialog}
    </>
  );
}
