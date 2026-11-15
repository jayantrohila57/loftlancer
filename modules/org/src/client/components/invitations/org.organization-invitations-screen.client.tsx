"use client"

import { FormKit } from "@features/form"
import { authClient } from "@packages/better-auth/client"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import Shell from "@packages/ui/components/shell"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"

import { formatOrgClientError } from "../../../utils/org.client-error"
import { isInvitationAcceptable } from "../../../utils/validation/org.invitation-role"
import { OrgInvitationAccessGate } from "./org.invitation-access-gate.client"
import type { OrganizationInviteFormValues } from "./org.organization-invitations.schema.client"
import { createOrganizationInviteFormSchema } from "./org.organization-invitations.schema.client"

type PendingInvitation = {
  id: string
  email: string
  role?: string | null
  status?: string
  expiresAt: Date | string
}

type UiTranslate = ReturnType<typeof useTranslations<"ui">>

function formatInvitationRoleLabel(
  role: string | null | undefined,
  t: UiTranslate
) {
  const value = role?.split(",").map((part) => part.trim())[0] ?? "member"
  if (value === "manager") return t("organizationRoleManager")
  if (value === "member") return t("organizationRoleMember")
  return value
}

function OrgOrganizationInvitationsBody() {
  const t = useTranslations("ui")
  const inviteSchema = useMemo(() => createOrganizationInviteFormSchema(t), [t])
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await authClient.organization.listInvitations()
      if (result.error) {
        throw new Error(
          formatOrgClientError(result.error, {
            fallback: t("invitationsLoadError"),
            limitMessage: t("organizationCreateLimitReached"),
            slugTakenMessage: t("organizationSlugAlreadyTaken"),
          })
        )
      }
      const pending = (result.data ?? []).filter(
        (item: PendingInvitation) => (item.status ?? "pending") === "pending"
      )
      setInvitations(pending)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invitationsLoadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load().catch(() => setError(t("invitationsLoadError")))
  }, [load, t])

  async function sendInvite(values: OrganizationInviteFormValues) {
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
          await load()
        })(),
        {
          error: t("organizationInviteSendError"),
          loading: t("organizationInviteSending"),
          success: t("organizationInviteSent"),
        }
      )
    } catch {
      // Toast reports failure; form stays editable.
    }
  }

  async function cancelInvite(invitation: PendingInvitation) {
    setBusyId(invitation.id)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.cancelInvitation({
            invitationId: invitation.id,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("organizationInvitationCancelError")
            )
          }
          await load()
        })(),
        {
          error: t("organizationInvitationCancelError"),
          loading: t("organizationInvitationCanceling"),
          success: t("organizationInvitationCanceled"),
        }
      )
    } catch {
      // Toast reports failure.
    } finally {
      setBusyId(null)
    }
  }

  async function resendInvite(invitation: PendingInvitation) {
    setBusyId(invitation.id)
    try {
      await toastManager.promise(
        (async () => {
          const role =
            invitation.role?.split(",").map((part) => part.trim())[0] ??
            "member"
          const result = await authClient.organization.inviteMember({
            email: invitation.email,
            resend: true,
            role,
          })
          if (result.error) {
            throw new Error(
              formatOrgClientError(result.error, {
                fallback: t("organizationInvitationResendError"),
                limitMessage: t("organizationCreateLimitReached"),
                slugTakenMessage: t("organizationSlugAlreadyTaken"),
              })
            )
          }
          await load()
        })(),
        {
          error: t("organizationInvitationResendError"),
          loading: t("organizationInvitationResending"),
          success: t("organizationInvitationResent"),
        }
      )
    } catch {
      // Toast reports failure.
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Shell.Section variant="dashboard" className="flex flex-col gap-4">
      <Frame>
        <FrameHeader>
          <FrameTitle>{t("organizationInviteMemberTitle")}</FrameTitle>
          <FrameDescription>
            {t("organizationInvitationsManageDescription")}
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <FormKit
            variant="embedded"
            schema={inviteSchema}
            defaultValues={{ email: "", role: "member" }}
            onSubmit={sendInvite}
          >
            <FormKit.Field
              type="email"
              name="email"
              label={t("organizationInviteEmail")}
            />
            <FormKit.Field
              type="select"
              name="role"
              label={t("organizationInviteRole")}
              options={[
                { value: "member", label: t("organizationRoleMember") },
                { value: "manager", label: t("organizationRoleManager") },
              ]}
            />
            <FormKit.Actions>
              <FormKit.Submit />
            </FormKit.Actions>
          </FormKit>
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader>
          <FrameTitle>{t("organizationPendingInvitationsTitle")}</FrameTitle>
          <FrameDescription>
            {t("organizationInvitationsSummary")}
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {!loading && !error && invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("organizationNoPendingInvitations")}
            </p>
          ) : null}
          {!loading &&
            invitations.map((invitation) => {
              const actionable = isInvitationAcceptable({
                expiresAt: invitation.expiresAt,
                status: invitation.status ?? "pending",
              })
              return (
                <div
                  key={invitation.id}
                  className="flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatInvitationRoleLabel(invitation.role, t)}
                    </p>
                  </div>
                  {!actionable ? (
                    <Badge variant="secondary">
                      {t("organizationInvitationExpired")}
                    </Badge>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={!actionable || busyId !== null}
                    onClick={() => {
                      resendInvite(invitation).catch(() =>
                        setError(t("organizationInvitationResendError"))
                      )
                    }}
                  >
                    {t("organizationInvitationResend")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busyId !== null}
                    onClick={() => {
                      cancelInvite(invitation).catch(() =>
                        setError(t("organizationInvitationCancelError"))
                      )
                    }}
                  >
                    {t("organizationInvitationCancel")}
                  </Button>
                </div>
              )
            })}
        </FramePanel>
      </Frame>
    </Shell.Section>
  )
}

export function OrgOrganizationInvitationsScreen() {
  return (
    <OrgInvitationAccessGate>
      <OrgOrganizationInvitationsBody />
    </OrgInvitationAccessGate>
  )
}
