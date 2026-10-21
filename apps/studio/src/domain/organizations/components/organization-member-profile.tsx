"use client";

import { normalizeOrgRole } from "@loftlancer/actions";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Can } from "@/domain/permissions/components/can";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function OrganizationMemberProfiles({
  memberId,
  onClose,
}: {
  memberId: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const members = useQuery(trpc.organizations.listMembers.queryOptions());
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
                          {member.access?.customRole ? (
                            <>
                              <p>
                                Additional organization access:{" "}
                                <span className="font-medium">
                                  {member.access.customRole.name}
                                </span>
                              </p>
                              <p className="text-muted-foreground">
                                Grants {member.access.customRole.actions.length}{" "}
                                organization permissions. Project and app access
                                still follows project and team assignments.
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">
                              No additional organization role is assigned.
                              Project and app access follows project and team
                              assignments.
                            </p>
                          )}
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
      {ConfirmDialog}
    </>
  );
}
