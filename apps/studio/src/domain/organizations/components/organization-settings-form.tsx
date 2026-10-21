"use client";

import { getMemberRemovalBlockReason } from "@loftlancer/auth/member-removal-policy";
import { Button } from "@loftlancer/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetDescription } from "@loftlancer/ui/sheet";
import { Spinner } from "@loftlancer/ui/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  invitationsEmpty,
  membersTableEmpty,
} from "@/components/data-table/data-table-empty-presets";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { OrganizationInvitationsTable } from "@/components/org/organization-invitations-table";
import { OrganizationMembersTable } from "@/components/org/organization-members-table";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { useFormSheetRequestClose } from "@/components/patterns/form-sheet-guard-context";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { useNotificationMutations } from "@/domain/notifications/hooks/use-notifications";
import { authClient, MEMBER_PAGE_LIMIT } from "@/lib/auth-client";
import { isOrganizationProfileEditDirty } from "@/lib/form-dirty";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { assignableInviteRoles } from "@/lib/invite-emails";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isPersonalOrganization } from "@/lib/org-personal";
import {
  formatOrganizationCreateError,
  resolveOrgSlugForSave,
} from "@/lib/org-slug";
import {
  cancelOrganizationInvitation,
  type OrganizationInvitationRow,
  pendingOrganizationInvitations,
  resendOrganizationInvitation,
} from "@/lib/organization-invitations";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { BulkInviteDialog } from "./bulk-invite-dialog";

type MemberRow = {
  id: string;
  role: string;
  createdAt?: Date | string;
  user: { name: string; email: string; id?: string };
};

/** Matches `organizations.listInvitations` max page size and Invitations route. */
const PENDING_INVITATIONS_LIMIT = 200;

const ROLES = ["member", "manager", "owner"] as const;

type OrgMemberRole = (typeof ROLES)[number];

const ROLE_SELECT_ITEMS = ROLES.map((role) => ({
  value: role,
  label: role,
}));

function EditOrganizationSheetCancelButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const requestClose = useFormSheetRequestClose();
  return (
    <Button
      variant="ghost"
      type="button"
      disabled={disabled}
      onClick={requestClose}
    >
      Cancel
    </Button>
  );
}

function EditOrganizationFormSheetPopup({ children }: { children: ReactNode }) {
  const requestClose = useFormSheetRequestClose();
  return (
    <FormSheetPopup
      closeProps={{
        onClick: (event) => {
          event.preventDefault();
          requestClose();
        },
      }}
    >
      {children}
    </FormSheetPopup>
  );
}

function OrganizationSettingsPanel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AccordionSection title={title} className={className}>
      {children}
    </AccordionSection>
  );
}

export type OrganizationSettingsMode =
  | "settings-hub"
  | "general"
  | "members"
  | "danger";

export function OrganizationSettingsForm({
  organizationId,
  mode,
}: {
  organizationId: string;
  mode: OrganizationSettingsMode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { syncInvitationReceived } = useNotificationMutations();
  const { refreshOrganizations, orgs, setActiveOrganization } =
    useActiveOrganization();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitationRow[]>(
    [],
  );
  const [editSnapshot, setEditSnapshot] = useState({ name: "", slug: "" });
  const [editDraftName, setEditDraftName] = useState("");
  const [editDraftSlug, setEditDraftSlug] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgMetadata, setOrgMetadata] = useState<
    string | Record<string, unknown> | null
  >(null);
  const [initialSlug, setInitialSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [slugError, setSlugError] = useState<string | undefined>();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [rolePendingId, setRolePendingId] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const editOrgCloseWithoutPromptRef = useRef<(() => void) | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const [transferSheetOpen, setTransferSheetOpen] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState("");
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [memberRemovalConfirmOpen, setMemberRemovalConfirmOpen] =
    useState(false);
  const [memberRemovalPendingId, setMemberRemovalPendingId] = useState<
    string | null
  >(null);
  const [pendingMemberRemoval, setPendingMemberRemoval] =
    useState<MemberRow | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    memberId: string;
    role: string;
    email: string;
  } | null>(null);

  const currentUserId = session?.user?.id;
  const myMembership = members.find(
    (m) => m.user.id === currentUserId || m.user.email === session?.user?.email,
  );
  const isOwner = myMembership?.role === "owner";
  const canInvite = assignableInviteRoles(myMembership?.role).length > 0;
  const isPersonal = isPersonalOrganization({ metadata: orgMetadata });
  const pendingInvitations = pendingOrganizationInvitations(invitations);
  const ownerCount = members.filter((member) => member.role === "owner").length;

  const editDraftDirty = isOrganizationProfileEditDirty(
    editDraftName,
    editDraftSlug,
    editSnapshot.name,
    editSnapshot.slug,
  );

  const resetEditDraft = useCallback(() => {
    setEditDraftName(editSnapshot.name);
    setEditDraftSlug(editSnapshot.slug);
    setSlugError(undefined);
  }, [editSnapshot.name, editSnapshot.slug]);

  const loadOrganization = useCallback(
    async (targetOrgId: string) => {
      const org = await authClient.organization.getFullOrganization({
        query: { organizationId: targetOrgId },
      });
      if (!org.data || org.data.id !== targetOrgId) {
        throw new Error("Organization not found");
      }
      setOrgName(org.data.name);
      setOrgSlug(org.data.slug);
      setInitialSlug(org.data.slug);
      setOrgMetadata(org.data.metadata ?? null);
      const list = await authClient.organization.listMembers({
        query: { organizationId: targetOrgId, limit: MEMBER_PAGE_LIMIT },
      });
      setMembers((list.data?.members ?? []) as MemberRow[]);
      const inviteData = await queryClient.fetchQuery(
        trpc.organizations.listInvitations.queryOptions({
          organizationId: targetOrgId,
          status: "pending",
          limit: PENDING_INVITATIONS_LIMIT,
          offset: 0,
        }),
      );
      setInvitations((inviteData.rows ?? []) as OrganizationInvitationRow[]);
    },
    [queryClient],
  );

  const transferOwnershipMutation = useMutation(
    trpc.organizations.transferOwnership.mutationOptions({
      onSuccess: async () => {
        const target = members.find((m) => m.user.id === transferTargetUserId);
        toast.success(
          `Ownership transferred to ${target?.user.name || target?.user.email || "the selected member"}`,
        );
        setTransferConfirmOpen(false);
        setTransferSheetOpen(false);
        setTransferTargetUserId("");
        await loadOrganization(organizationId);
        await refreshOrganizations();
      },
      onError: (error) =>
        toast.error(error.message || "Could not transfer ownership"),
    }),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSlugError(undefined);
    setDeleteOpen(false);

    void (async () => {
      try {
        await loadOrganization(organizationId);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, loadOrganization]);

  const revokeInvitation = async (invitationId: string) => {
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
      await loadOrganization(organizationId);
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
    setResendingId(invite.id);
    try {
      await toast.promise(
        resendOrganizationInvitation(authClient.organization, {
          organizationId,
          email: invite.email,
          role: invite.role,
        }),
        {
          loading: "Resending invitation…",
          success: "Invitation resent",
          error: "Could not resend invitation",
        },
      );
      await loadOrganization(organizationId);
      if (isNotificationsEnabledOnClient() && currentUserId) {
        void syncInvitationReceived.mutate({
          organizationId,
          email: invite.email,
        });
      }
    } finally {
      setResendingId(null);
    }
  };

  const requestRoleChange = (memberId: string, role: string, email: string) => {
    setPendingRoleChange({ memberId, role, email });
    setRoleConfirmOpen(true);
  };

  const handleRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { memberId, role } = pendingRoleChange;
    const target = members.find((member) => member.id === memberId);
    if (target?.role === "owner" && ownerCount <= 1 && role !== "owner") {
      toast.error(
        "Transfer ownership first; the organization must have an owner.",
      );
      setRoleConfirmOpen(false);
      setPendingRoleChange(null);
      return;
    }
    setRolePendingId(memberId);
    try {
      await toast.promise(
        authClient.organization.updateMemberRole({
          memberId,
          role: role as OrgMemberRole,
          organizationId,
        }),
        {
          loading: "Updating role…",
          success: "Role updated",
          error: "Could not update role",
        },
      );
      setRoleConfirmOpen(false);
      setPendingRoleChange(null);
      await loadOrganization(organizationId);
    } catch {
      // Toast handled by toast.promise
    } finally {
      setRolePendingId(null);
    }
  };

  const requestMemberRemoval = (member: MemberRow) => {
    const blockReason = getMemberRemovalBlockReason({
      actorUserId: currentUserId ?? "",
      targetUserId: member.user.id ?? "",
      targetRole: member.role,
      activeOwnerCount: ownerCount,
    });
    if (blockReason) {
      toast.error(
        blockReason === "self"
          ? "Use Leave organization to remove yourself."
          : "Transfer ownership before removing the only owner.",
      );
      return;
    }
    setPendingMemberRemoval(member);
    setMemberRemovalConfirmOpen(true);
  };

  const handleMemberRemoval = async () => {
    const member = pendingMemberRemoval;
    const memberIdOrEmail = member?.user.id ?? member?.user.email;
    if (!member || !memberIdOrEmail) return;

    setMemberRemovalPendingId(member.id);
    try {
      const result = await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not remove member");
      }
      toast.success(`Removed ${member.user.name || member.user.email}`);
      setMemberRemovalConfirmOpen(false);
      setPendingMemberRemoval(null);
      await loadOrganization(organizationId);
      void invalidateAfterOrganizationChange(queryClient);
      await refreshOrganizations();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove member",
      );
    } finally {
      setMemberRemovalPendingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError(undefined);
    setSavePending(true);
    try {
      const slugToSave = resolveOrgSlugForSave(editDraftSlug, initialSlug);
      await toast.promise(
        (async () => {
          const result = await authClient.organization.update({
            organizationId,
            data: {
              name: editDraftName.trim(),
              slug: slugToSave,
            },
          });
          if (result.error) {
            const message = formatOrganizationCreateError(result.error.message);
            if (message.toLowerCase().includes("slug")) {
              setSlugError(message);
            }
            throw new Error(message);
          }
        })(),
        {
          loading: "Saving organization…",
          success: "Organization updated",
          error: "Could not update organization",
        },
      );
      editOrgCloseWithoutPromptRef.current?.();
      setEditOrgOpen(false);
      await loadOrganization(organizationId);
      await refreshOrganizations();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async () => {
    const deletedId = organizationId;
    const deletedName = orgName;
    const fallback = orgs.find((o) => o.id !== deletedId);

    setDeleteOpen(false);
    setDeletePending(true);
    router.replace(routes.home());
    void invalidateAfterOrganizationChange(queryClient);

    try {
      await toast.promise(
        (async () => {
          const result = await authClient.organization.delete({
            organizationId: deletedId,
          });
          if (result.error) {
            throw new Error(
              result.error.message ?? "Could not delete organization",
            );
          }
        })(),
        {
          loading: "Deleting organization…",
          success: `Deleted ${deletedName}`,
          error: "Could not delete organization",
        },
      );
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setDeletePending(false);
    }
  };

  const handleLeave = async () => {
    setLeavePending(true);
    setLeaveConfirmOpen(false);
    const leftId = organizationId;
    const fallback = orgs.find((o) => o.id !== leftId);
    router.replace(routes.home());
    void invalidateAfterOrganizationChange(queryClient);

    try {
      await toast.promise(
        (async () => {
          const result = await authClient.organization.leave({
            organizationId: leftId,
          });
          if (result.error) {
            throw new Error(
              result.error.message ?? "Could not leave organization",
            );
          }
        })(),
        {
          loading: "Leaving organization…",
          success: "You left the organization",
          error: "Could not leave organization",
        },
      );
      if (fallback) {
        await setActiveOrganization(fallback.id);
      } else {
        await refreshOrganizations();
      }
      router.refresh();
    } catch {
      // Toast handled by toast.promise
    } finally {
      setLeavePending(false);
    }
  };

  if (loading) {
    const sections =
      mode === "settings-hub"
        ? [
            { key: "general", rows: 2 },
            { key: "members", rows: 4 },
            { key: "danger", rows: 2 },
          ]
        : [
            {
              key: mode,
              rows: mode === "members" ? 4 : 2,
            },
          ];
    return (
      <div className="flex min-w-0 flex-col gap-2">
        {sections.map(({ key, rows }) => (
          <AccordionSectionSkeleton key={key} rows={rows} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Organization settings unavailable"
        description="Select an organization or complete onboarding first."
        onRetry={() => void loadOrganization(organizationId)}
      />
    );
  }

  return (
    <>
      {(mode === "general" || mode === "settings-hub") && (
        <OrganizationSettingsPanel title="General" className="min-w-0">
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 gap-2"
              onClick={() => {
                const snapshot = { name: orgName, slug: orgSlug };
                setEditSnapshot(snapshot);
                setEditDraftName(snapshot.name);
                setEditDraftSlug(snapshot.slug);
                setSlugError(undefined);
                setEditOrgOpen(true);
              }}
            >
              <AppIcon name="edit" className="text-current" />
              Edit organization
            </Button>
          </div>
          <SettingsPanel>
            <SettingsSectionHeader
              title="Profile"
              description="Name and slug for this workspace."
              icon="organization"
            />
            <SettingsRow label="Name" description="Organization display name.">
              <span className="text-sm">{orgName}</span>
            </SettingsRow>
            <SettingsRow
              label="Slug"
              description="URL-safe workspace identifier."
            >
              <span className="font-mono text-sm">{orgSlug}</span>
            </SettingsRow>
          </SettingsPanel>
        </OrganizationSettingsPanel>
      )}

      {mode === "members" && (
        <OrganizationSettingsPanel
          title="Members and invitations"
          className="min-w-0 space-y-2"
        >
          {mode === "members" && canInvite ? (
            <div className="flex justify-end">
              <div className="flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => setTransferSheetOpen(true)}
                  >
                    <AppIcon name="member" />
                    Transfer ownership
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() => setInviteOpen(true)}
                >
                  <AppIcon name="invite" className="text-current" />
                  Invite member
                </Button>
              </div>
            </div>
          ) : null}
          <SettingsPanel>
            {mode !== "members" ? (
              <SettingsSectionHeader
                title="Members"
                description="Invite teammates and manage roles."
                icon="member"
              />
            ) : null}
            {mode !== "members" ? (
              <SettingsRow label="Invite" description="Add someone by email.">
                {canInvite ? (
                  <Button
                    type="button"
                    size="sm"
                    className="w-fit gap-2"
                    onClick={() => setInviteOpen(true)}
                  >
                    <AppIcon name="invite" className="text-current" />
                    Invite member
                  </Button>
                ) : null}
              </SettingsRow>
            ) : null}
            {members.length === 0 ? (
              <div className="px-4 py-6">
                <Empty className="border border-dashed py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <AppIcon name="member" className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Invite your first member</EmptyTitle>
                    <EmptyDescription>
                      {pendingInvitations.length > 0
                        ? `${pendingInvitations.length} pending ${pendingInvitations.length === 1 ? "invitation is" : "invitations are"} awaiting acceptance.`
                        : "Paste a few emails to share projects and environments with your team."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="min-w-0 space-y-3 overflow-x-auto px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="search"
                    aria-label="Search members"
                    placeholder="Search by name, email or role"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <span className="text-muted-foreground text-xs">
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <OrganizationMembersTable
                  members={members.filter((m) => {
                    const q = memberQuery.trim().toLowerCase();
                    if (!q) return true;
                    return [m.user.name, m.user.email, m.role]
                      .filter(Boolean)
                      .some((v) => String(v).toLowerCase().includes(q));
                  })}
                  roleSelectItems={ROLE_SELECT_ITEMS}
                  isOwner={isOwner}
                  rolePendingId={rolePendingId}
                  currentUserId={currentUserId}
                  removalPendingId={memberRemovalPendingId}
                  onRemove={requestMemberRemoval}
                  onRoleChange={(memberId, role) => {
                    const member = members.find((m) => m.id === memberId);
                    requestRoleChange(
                      memberId,
                      role,
                      member?.user.email ?? "member",
                    );
                  }}
                  empty={membersTableEmpty()}
                />
              </div>
            )}
          </SettingsPanel>

          {mode !== "members" ? (
            <SettingsPanel>
              <SettingsSectionHeader
                title="Invitations"
                description="Pending email invites."
                icon="mail"
              />
              <div className="px-4 py-4">
                {pendingInvitations.length === 0 ? (
                  <Empty className="border border-dashed py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AppIcon name="mail" className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>{invitationsEmpty().empty.title}</EmptyTitle>
                      <EmptyDescription>
                        {invitationsEmpty().empty.description}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      {canInvite ? (
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2"
                          onClick={() => setInviteOpen(true)}
                        >
                          <AppIcon name="invite" className="text-current" />
                          Invite member
                        </Button>
                      ) : null}
                    </EmptyContent>
                  </Empty>
                ) : (
                  <OrganizationInvitationsTable
                    invitations={pendingInvitations}
                    empty={invitationsEmpty(
                      canInvite ? (
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2"
                          onClick={() => setInviteOpen(true)}
                        >
                          <AppIcon name="invite" className="text-current" />
                          Invite member
                        </Button>
                      ) : undefined,
                    )}
                    revokingId={revokingId}
                    resendingId={resendingId}
                    onRevoke={(id) => void revokeInvitation(id)}
                    onResend={(invite) => void resendInvitation(invite)}
                  />
                )}
              </div>
            </SettingsPanel>
          ) : null}
        </OrganizationSettingsPanel>
      )}

      {(mode === "danger" || mode === "settings-hub") && (
        <OrganizationSettingsPanel title="Danger zone" className="min-w-0">
          <SettingsPanel className="border-destructive/32 bg-destructive/4">
            <SettingsSectionHeader
              title="Danger zone"
              description="Irreversible organization actions."
              icon="danger"
            />
            {isOwner ? (
              isPersonal ? (
                <SettingsRow
                  label="Personal workspace"
                  description="Your personal workspace cannot be deleted."
                >
                  <span className="text-muted-foreground text-xs">—</span>
                </SettingsRow>
              ) : (
                <SettingsRow
                  label="Delete organization"
                  description="Removes members and invitations. Projects must be removed or moved first."
                >
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-fit"
                      disabled={orgs.length <= 1 || deletePending}
                      onClick={() => {
                        setDeleteOpen(true);
                      }}
                    >
                      Delete organization
                    </Button>
                    {orgs.length <= 1 ? (
                      <p className="max-w-[14rem] text-end text-muted-foreground text-xs">
                        Create another organization before deleting this one.
                      </p>
                    ) : null}
                  </div>
                </SettingsRow>
              )
            ) : (
              <SettingsRow
                label="Leave organization"
                description="You will lose access to its projects."
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={leavePending}
                  onClick={() => setLeaveConfirmOpen(true)}
                >
                  {leavePending ? (
                    <>
                      <Spinner className="me-2" />
                      Leaving…
                    </>
                  ) : (
                    "Leave organization"
                  )}
                </Button>
              </SettingsRow>
            )}
          </SettingsPanel>
        </OrganizationSettingsPanel>
      )}

      <FormSheet
        open={editOrgOpen}
        onOpenChange={setEditOrgOpen}
        isDirty={editDraftDirty}
        onDiscard={resetEditDraft}
        onClosed={() => {
          setEditDraftName(orgName);
          setEditDraftSlug(orgSlug);
          setSlugError(undefined);
        }}
        closeWithoutPromptRef={editOrgCloseWithoutPromptRef}
      >
        <EditOrganizationFormSheetPopup>
          <FormSheetHeader>
            <SheetTitleWithIcon icon="organization">
              Edit organization
            </SheetTitleWithIcon>
            <SheetDescription>
              Update the name and URL slug for this workspace.
            </SheetDescription>
          </FormSheetHeader>
          <FormSheetForm onSubmit={handleSaveProfile}>
            <FormSheetBody>
              <FormField id="org-name-edit" label="Name" required>
                <Input
                  id="org-name-edit"
                  value={editDraftName}
                  onChange={(e) => setEditDraftName(e.target.value)}
                />
              </FormField>
              <FormField
                id="org-slug-edit"
                label="Slug"
                required
                hint="Slugs use lowercase letters, numbers, and hyphens."
                error={slugError}
              >
                <OrgSlugInput
                  id="org-slug-edit"
                  value={editDraftSlug}
                  onChange={(value) => {
                    setSlugError(undefined);
                    setEditDraftSlug(value);
                  }}
                />
              </FormField>
            </FormSheetBody>
            <FormSheetFooter>
              <EditOrganizationSheetCancelButton disabled={savePending} />
              <SubmitButton isLoading={savePending} loadingLabel="Saving…">
                Save changes
              </SubmitButton>
            </FormSheetFooter>
          </FormSheetForm>
        </EditOrganizationFormSheetPopup>
      </FormSheet>

      <BulkInviteDialog
        organizationId={organizationId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        inviterRole={myMembership?.role ?? null}
        memberEmails={members.map((m) => m.user.email)}
        pendingEmails={pendingInvitations.map((i) => i.email)}
        onInvited={() => void loadOrganization(organizationId)}
      />

      <FormSheet
        open={transferSheetOpen}
        onOpenChange={(open) => {
          setTransferSheetOpen(open);
          if (
            !open &&
            !transferConfirmOpen &&
            !transferOwnershipMutation.isPending
          ) {
            setTransferTargetUserId("");
          }
        }}
      >
        <FormSheetPopup>
          <FormSheetHeader>
            <SheetTitleWithIcon icon="member">
              Transfer ownership
            </SheetTitleWithIcon>
            <SheetDescription>
              Choose an active member to own this organization. You will become
              a manager.
            </SheetDescription>
          </FormSheetHeader>
          <FormSheetBody>
            <FormField id="organization-new-owner" label="New owner">
              <SearchableCombobox
                id="organization-new-owner"
                value={transferTargetUserId}
                onChange={setTransferTargetUserId}
                ariaLabel="Choose a new organization owner"
                placeholder="Select a member"
                searchPlaceholder="Search members…"
                className="w-full"
                options={members
                  .filter(
                    (member) =>
                      member.user.id && member.user.id !== currentUserId,
                  )
                  .map((member) => ({
                    value: member.user.id as string,
                    label: member.user.name || member.user.email,
                    hint: member.user.email,
                  }))}
              />
            </FormField>
          </FormSheetBody>
          <FormSheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !transferTargetUserId || transferOwnershipMutation.isPending
              }
              onClick={() => setTransferConfirmOpen(true)}
            >
              Continue
            </Button>
          </FormSheetFooter>
        </FormSheetPopup>
      </FormSheet>

      <ConfirmDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title="Leave organization"
        description={`Leave ${orgName}? You will lose access to its projects and environments.`}
        confirmLabel="Leave organization"
        variant="destructive"
        onConfirm={handleLeave}
        isPending={leavePending}
      />

      <ConfirmDialog
        open={roleConfirmOpen}
        onOpenChange={(open) => {
          setRoleConfirmOpen(open);
          if (!open) setPendingRoleChange(null);
        }}
        title="Change member role"
        description={
          pendingRoleChange
            ? `Change role for ${pendingRoleChange.email} to ${pendingRoleChange.role}?`
            : "Confirm role change."
        }
        confirmLabel="Update role"
        onConfirm={handleRoleChange}
        isPending={rolePendingId !== null}
      />

      <ConfirmDialog
        open={memberRemovalConfirmOpen}
        onOpenChange={(open) => {
          setMemberRemovalConfirmOpen(open);
          if (!open && memberRemovalPendingId === null) {
            setPendingMemberRemoval(null);
          }
        }}
        title="Remove organization member"
        description={
          pendingMemberRemoval
            ? `Remove ${pendingMemberRemoval.user.name || pendingMemberRemoval.user.email} from ${orgName}? They will lose access to this organization’s teams and projects.`
            : "Confirm member removal."
        }
        confirmLabel="Remove member"
        variant="destructive"
        onConfirm={handleMemberRemoval}
        isPending={memberRemovalPendingId !== null}
      />

      <ConfirmDialog
        open={transferConfirmOpen}
        onOpenChange={(open) => {
          setTransferConfirmOpen(open);
          if (!open && !transferOwnershipMutation.isPending) {
            setTransferTargetUserId("");
          }
        }}
        title="Transfer organization ownership"
        description={(() => {
          const target = members.find(
            (member) => member.user.id === transferTargetUserId,
          );
          return target
            ? `Transfer ${orgName} to ${target.user.name || target.user.email}? You will become a manager and the new owner will control membership and organization settings.`
            : "Choose an active organization member to receive ownership.";
        })()}
        confirmLabel="Transfer ownership"
        onConfirm={() => {
          if (transferTargetUserId) {
            transferOwnershipMutation.mutate({
              targetUserId: transferTargetUserId,
            });
          }
        }}
        isPending={transferOwnershipMutation.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete organization"
        description={`Delete organization ${orgSlug} with all its projects, environments and variables? This cannot be undone.`}
        confirmLabel="Delete organization"
        confirmText={orgName}
        variant="destructive"
        onConfirm={handleDelete}
        isPending={deletePending}
      />
    </>
  );
}
