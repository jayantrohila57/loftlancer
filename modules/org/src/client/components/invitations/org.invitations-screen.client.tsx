"use client"

import { authClient } from "@packages/better-auth/client"
import { clientEnv } from "@packages/t3-env/client"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@packages/ui/components/alert-dialog"
import { Button } from "@packages/ui/components/button"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import Shell from "@packages/ui/components/shell"
import { Spinner } from "@packages/ui/components/spinner"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { isOrgInvitationEmailVerificationError } from "../../../utils/org.invitation-email-verification"
import { activateOrganizationAfterJoin } from "../../../utils/org.organization-id"
import { isInvitationAcceptable } from "../../../utils/validation/org.invitation-role"
import { useOrgAppPaths } from "../org.app-paths.client"
import { OrgInvitationVerifyEmailPrompt } from "./org.invitation-verify-email-prompt.client"

type Invitation = {
  id: string
  organizationName?: string | null
  role?: string | null
  status?: string
  expiresAt: Date | string
}

export function OrgInvitationsScreen({
  onAccepted,
}: {
  readonly onAccepted?: (data: unknown) => void
} = {}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const paths = useOrgAppPaths()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const signedInEmail = session?.user.email?.trim() ?? null
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [declineTarget, setDeclineTarget] = useState<Invitation | null>(null)
  const [verifyRequired, setVerifyRequired] = useState(false)
  const load = useCallback(async () => {
    setListLoading(true)
    try {
      const result = await authClient.organization.listUserInvitations()
      if (result.error)
        throw new Error(result.error.message || t("invitationsLoadError"))
      const pending = (result.data ?? []).filter((item: Invitation) =>
        isInvitationAcceptable({
          status: item.status ?? "pending",
          expiresAt: item.expiresAt,
        })
      )
      setInvitations(pending)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invitationsLoadError"))
    } finally {
      setListLoading(false)
    }
  }, [t])
  useEffect(() => {
    void load().catch(() => setError(t("invitationsLoadError")))
  }, [load, t])
  useEffect(() => {
    if (sessionPending) return
    if (!session?.user) {
      setInvitations([])
      setError(null)
    }
  }, [session?.user, sessionPending])
  const loading = listLoading
  async function respond(id: string, accept: boolean): Promise<boolean> {
    setBusy(id)
    try {
      const result = accept
        ? await authClient.organization.acceptInvitation({ invitationId: id })
        : await authClient.organization.rejectInvitation({ invitationId: id })
      if (result.error) {
        if (accept && isOrgInvitationEmailVerificationError(result.error)) {
          setVerifyRequired(true)
          setError(null)
          return false
        }
        throw new Error(result.error.message || t("invitationActionError"))
      }
      setVerifyRequired(false)
      if (accept) {
        await activateOrganizationAfterJoin(
          authClient.organization.setActive.bind(authClient.organization),
          result.data,
          { switchErrorMessage: t("couldNotSwitchOrganization") }
        )
        onAccepted?.(result.data)
      }
      setError(null)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invitationActionError"))
      return false
    } finally {
      setBusy(null)
    }
  }
  async function confirmDecline() {
    if (!declineTarget || busy) return
    const ok = await respond(declineTarget.id, false)
    if (ok) setDeclineTarget(null)
  }
  return (
    <Shell.Section variant="dashboard">
      <Frame>
        <FrameHeader>
          <FrameTitle>{t("organizationInvitations")}</FrameTitle>
          <FrameDescription>
            {t("receivedInvitationsDescription")}
            {signedInEmail ? (
              <span className="mt-1 block text-muted-foreground">
                {t("receivedInvitationsSignedInAs", { email: signedInEmail })}
              </span>
            ) : null}
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          {loading ? <p>{t("loading")}</p> : null}
          {verifyRequired ? <OrgInvitationVerifyEmailPrompt /> : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {!loading && !error && invitations.length === 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {t("noReceivedInvitations")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(
                    /\/$/,
                    ""
                  )
                  void authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.assign(
                          `${base}/${locale}/sign-in?redirect=${encodeURIComponent(paths.organizationsInvitationsUrl)}`
                        )
                      },
                    },
                  })
                }}
              >
                {t("receivedInvitationsSwitchAccount")}
              </Button>
            </div>
          ) : null}
          {!loading &&
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {invitation.organizationName || invitation.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => setDeclineTarget(invitation)}
                >
                  {t("declineInvitation")}
                </Button>
                <Button
                  disabled={busy !== null}
                  onClick={() => {
                    respond(invitation.id, true).catch(() =>
                      setError(t("invitationActionError"))
                    )
                  }}
                >
                  {t("acceptInvitation")}
                </Button>
              </div>
            ))}
        </FramePanel>
      </Frame>
      <AlertDialog
        open={Boolean(declineTarget)}
        onOpenChange={(open) => {
          if (!busy && !open) setDeclineTarget(null)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("declineInvitationConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("declineInvitationDescription", {
                organization:
                  declineTarget?.organizationName ?? declineTarget?.id ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={busy !== null} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button
              variant="destructive"
              disabled={busy !== null}
              onClick={() => {
                void confirmDecline()
              }}
            >
              {busy ? <Spinner /> : null}{" "}
              {busy ? t("decliningInvitation") : t("declineInvitation")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </Shell.Section>
  )
}
