"use client"

import { FieldKit, FormKit } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { z } from "zod"
import { formatOrgClientError } from "../../../utils/org.client-error"
import type { OrgProductMemberRole } from "../../../utils/org.member-role"
import {
  canManageElevatedOrganizationMembers,
  canManageOrganizationMembers,
  isOrganizationAdminRole,
  isOrganizationOwnerRole,
  ORG_ASSIGNABLE_PRODUCT_MEMBER_ROLES,
  toProductMemberRole,
} from "../../../utils/org.member-role"
import { isInvitationAcceptable } from "../../../utils/validation/org.invitation-role"
import {
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
} from "../../hooks/org.session.client"
import { createOrganizationInviteFormSchema } from "../invitations/org.organization-invitations.schema.client"

type MemberUser = {
  readonly email?: string | null
  readonly name?: string | null
}

type OrganizationMember = {
  readonly id: string
  readonly userId: string
  readonly role: string
  readonly user?: MemberUser | null
}

type OrganizationInvitation = {
  readonly id: string
  readonly email: string
  readonly role?: string | null
  readonly status?: string
  readonly expiresAt: Date | string
}

function memberDisplayName(member: OrganizationMember) {
  const user = member.user
  return user?.name?.trim() || user?.email?.trim() || member.userId
}

function memberSecondaryLine(member: OrganizationMember) {
  const email = member.user?.email?.trim()
  const name = member.user?.name?.trim()
  if (email && name) return email
  return null
}

type UiTranslate = ReturnType<typeof useTranslations<"ui">>

function roleLabel(role: OrgProductMemberRole, t: UiTranslate): string {
  if (role === "owner") return t("organizationRoleOwner")
  if (role === "admin") return t("organizationRoleAdmin")
  if (role === "manager") return t("organizationRoleManager")
  return t("organizationRoleMember")
}

const memberRoleFieldSchema = z.object({
  role: z.enum(["member", "manager", "admin"]),
})

function OrgMemberRoleSelect({
  value,
  disabled,
  allowAdmin,
  onPick,
}: {
  readonly value: Exclude<OrgProductMemberRole, "owner">
  readonly disabled: boolean
  readonly allowAdmin: boolean
  readonly onPick: (role: Exclude<OrgProductMemberRole, "owner">) => void
}) {
  const t = useTranslations("ui")
  const roleOptions = ORG_ASSIGNABLE_PRODUCT_MEMBER_ROLES.filter(
    (role) => allowAdmin || role !== "admin"
  ).map((role) => ({
    value: role,
    label: roleLabel(role, t),
  }))

  return (
    <FieldKit
      schema={memberRoleFieldSchema}
      values={{ role: value }}
      onValuesChange={(next) => {
        if (disabled) return
        if (
          next.role !== "member" &&
          next.role !== "manager" &&
          next.role !== "admin"
        ) {
          return
        }
        if (next.role === value) return
        onPick(next.role)
      }}
    >
      <FieldKit.Field
        name="role"
        type="select"
        label={t("organizationMembersRoleColumn")}
        options={roleOptions}
        disabled={disabled}
      />
    </FieldKit>
  )
}

function OrgMembersInviteForm({
  onSent,
  allowAdmin,
}: {
  readonly onSent: () => void
  readonly allowAdmin: boolean
}) {
  const t = useTranslations("ui")
  const schema = useMemo(() => createOrganizationInviteFormSchema(t), [t])
  const inviteRoleOptions = [
    { value: "member", label: t("organizationRoleMember") },
    { value: "manager", label: t("organizationRoleManager") },
    ...(allowAdmin
      ? [{ value: "admin", label: t("organizationRoleAdmin") }]
      : []),
  ]

  return (
    <FormKit
      variant="embedded"
      schema={schema}
      defaultValues={{ email: "", role: "member" }}
      onSubmit={async (values) => {
        try {
          await toastManager.promise(
            (async () => {
              const result = await authClient.organization.inviteMember({
                email: values.email.trim().toLowerCase(),
                role: values.role,
              })
              if (result.error) {
                throw new Error(
                  formatOrgClientError(result.error, {
                    fallback: t("organizationInviteSendError"),
                    limitMessage: t("organizationCreateLimitReached"),
                    slugTakenMessage: t("organizationSlugAlreadyTaken"),
                  })
                )
              }
            })(),
            {
              loading: t("organizationInviteSending"),
              success: t("organizationInviteSent"),
              error: t("organizationInviteSendError"),
            }
          )
          await onSent()
        } catch {
          // Toast reports failure.
        }
      }}
    >
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <p className="text-sm font-medium">
          {t("organizationInviteMemberTitle")}
        </p>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_auto] sm:items-end">
          <FormKit.Field
            name="email"
            type="email"
            label={t("organizationInviteEmail")}
          />
          <FormKit.Field
            name="role"
            type="select"
            label={t("organizationInviteRole")}
            options={inviteRoleOptions}
          />
          <FormKit.Submit />
        </div>
      </div>
    </FormKit>
  )
}

function OrgMemberRow({
  member,
  canManage,
  canManageElevated,
  currentUserId,
  busyMemberId,
  onRoleChange,
  onRemove,
}: {
  readonly member: OrganizationMember
  readonly canManage: boolean
  readonly canManageElevated: boolean
  readonly currentUserId: string | undefined
  readonly busyMemberId: string | null
  readonly onRoleChange: (
    memberId: string,
    role: Exclude<OrgProductMemberRole, "owner">
  ) => void
  readonly onRemove: (memberId: string) => void
}) {
  const t = useTranslations("ui")
  const productRole = toProductMemberRole(member.role)
  const isOwner = isOrganizationOwnerRole(member.role)
  const isElevated = isOwner || isOrganizationAdminRole(member.role)
  const canEditMember = canManage && (!isElevated || canManageElevated)
  const isSelf = member.userId === currentUserId
  const editableRole: Exclude<OrgProductMemberRole, "owner"> =
    productRole === "admin"
      ? "admin"
      : productRole === "manager"
        ? "manager"
        : "member"

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {memberDisplayName(member)}
          {isSelf ? (
            <span className="text-muted-foreground">{` (${t("organizationMembersYou")})`}</span>
          ) : null}
        </p>
        {memberSecondaryLine(member) ? (
          <p className="text-sm text-muted-foreground">
            {memberSecondaryLine(member)}
          </p>
        ) : null}
      </div>
      {canEditMember && !isOwner ? (
        <OrgMemberRoleSelect
          allowAdmin={canManageElevated}
          value={editableRole}
          disabled={busyMemberId !== null}
          onPick={(role) => onRoleChange(member.id, role)}
        />
      ) : (
        <span className="text-sm text-muted-foreground">
          {roleLabel(productRole, t)}
        </span>
      )}
      {canEditMember && !isOwner ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busyMemberId !== null}
          loading={busyMemberId === member.id}
          onClick={() => onRemove(member.id)}
        >
          {t("organizationMembersRemove")}
        </Button>
      ) : null}
    </div>
  )
}

export function OrgMembers() {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const organizationId = useOrgSessionActiveId()
  const { role: activeRole, isPending: rolePending } = useOrgActiveMemberRole()
  const { data: session } = authClient.useSession()
  const {
    data: organization,
    isPending,
    error,
    refetch,
  } = authClient.useActiveOrganization()
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null)

  const canManage =
    !rolePending &&
    Boolean(activeRole && canManageOrganizationMembers(activeRole))
  const canManageElevated =
    !rolePending &&
    Boolean(activeRole && canManageElevatedOrganizationMembers(activeRole))

  const members = (organization?.members ?? []) as OrganizationMember[]
  const invitations = (
    (organization?.invitations ?? []) as OrganizationInvitation[]
  ).filter((row) =>
    isInvitationAcceptable({
      status: row.status ?? "pending",
      expiresAt: row.expiresAt,
    })
  )

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>
            {t("organizationInvitationsNoActiveOrgTitle")}
          </EmptyTitle>
          <EmptyDescription>
            {t("organizationInvitationsNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (isPending || rolePending) {
    return <Skeleton className="h-32 w-full" />
  }

  if (error || !organization) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {t("organizationMembersLoadError")}
      </p>
    )
  }

  async function reload() {
    await refetch()
  }

  async function removeMember(memberId: string) {
    setBusyMemberId(memberId)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.removeMember({
            memberIdOrEmail: memberId,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("organizationMembersRemoveError")
            )
          }
        })(),
        {
          loading: t("organizationMembersRemoveSending"),
          success: t("organizationMembersRemoved"),
          error: t("organizationMembersRemoveError"),
        }
      )
      await reload()
    } finally {
      setBusyMemberId(null)
    }
  }

  async function updateRole(
    memberId: string,
    role: Exclude<OrgProductMemberRole, "owner">
  ) {
    setBusyMemberId(memberId)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.updateMemberRole({
            memberId,
            role,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("organizationMembersRoleUpdateError")
            )
          }
        })(),
        {
          loading: t("organizationMembersRoleUpdating"),
          success: t("organizationMembersRoleUpdated"),
          error: t("organizationMembersRoleUpdateError"),
        }
      )
      await reload()
    } finally {
      setBusyMemberId(null)
    }
  }

  async function cancelInvitation(invitationId: string) {
    setBusyInvitationId(invitationId)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.cancelInvitation({
            invitationId,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("organizationInvitationCancelError")
            )
          }
        })(),
        {
          loading: t("organizationInvitationCanceling"),
          success: t("organizationInvitationCanceled"),
          error: t("organizationInvitationCancelError"),
        }
      )
      await reload()
    } finally {
      setBusyInvitationId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          {t("organizationMembersReadOnlyNotice")}
        </p>
      ) : null}
      {canManage ? (
        <OrgMembersInviteForm allowAdmin={canManageElevated} onSent={reload} />
      ) : null}
      <div>
        <p className="mb-2 text-sm font-medium">
          {t("organizationMembersListTitle")}
        </p>
        {!members.length ? (
          <p className="text-sm text-muted-foreground">
            {t("organizationMembersEmpty")}
          </p>
        ) : (
          members.map((member) => (
            <OrgMemberRow
              key={member.id}
              member={member}
              canManage={canManage}
              canManageElevated={canManageElevated}
              currentUserId={session?.user.id}
              busyMemberId={busyMemberId}
              onRoleChange={updateRole}
              onRemove={removeMember}
            />
          ))
        )}
      </div>
      {canManage && invitations.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("organizationPendingInvitationsTitle")}
          </p>
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  {roleLabel(
                    toProductMemberRole(invitation.role ?? "member"),
                    t
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={busyInvitationId !== null}
                loading={busyInvitationId === invitation.id}
                onClick={() => cancelInvitation(invitation.id)}
              >
                {t("organizationInvitationCancel")}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
