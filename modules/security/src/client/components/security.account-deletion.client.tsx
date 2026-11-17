"use client"

import { AuthSessionEndedNotice } from "@modules/auth"
import { ACCOUNT_DELETION_FRESH_SESSION_SECONDS } from "@modules/security/utils"
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
import { Field, FieldLabel } from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useSecurityAccountDeletionApi } from "../hooks/security.account-deletion.hooks"

function sessionIsFresh(createdAt: Date | string | undefined) {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  if (!Number.isFinite(created)) return false
  return Date.now() - created < ACCOUNT_DELETION_FRESH_SESSION_SECONDS * 1_000
}

export function SecurityAccountDeletionScreen() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: session, isPending } = authClient.useSession()
  const deleteAccount = useSecurityAccountDeletionApi.useDelete()
  const deletionStatus = useSecurityAccountDeletionApi.useStatus(
    session?.user.id
  )
  const blockers = deletionStatus.data?.blockers ?? []
  const deleteBlocked = blockers.length > 0
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [, setFreshnessVersion] = useState(0)
  const email = session?.user.email ?? ""
  const confirmationMatches = confirmation.trim() === email
  const createdAt = session?.session.createdAt
  const fresh = sessionIsFresh(createdAt)

  useEffect(() => {
    if (!createdAt) return
    const expiresAt =
      new Date(createdAt).getTime() +
      ACCOUNT_DELETION_FRESH_SESSION_SECONDS * 1_000
    const remaining = expiresAt - Date.now()
    if (!Number.isFinite(remaining) || remaining <= 0) return
    const timer = window.setTimeout(
      () => setFreshnessVersion((value) => value + 1),
      remaining
    )
    return () => window.clearTimeout(timer)
  }, [createdAt])

  async function removeAccount() {
    if (!confirmationMatches || deleteAccount.isPending || deleteBlocked) return
    if (!sessionIsFresh(createdAt)) {
      setFreshnessVersion((value) => value + 1)
      return
    }
    try {
      await toastManager.promise(
        (async () => {
          await deleteAccount.mutateAsync({})
        })(),
        {
          loading: t("deletingAccount"),
          success: t("accountDeleted"),
          error: (error) =>
            error instanceof Error && /session/i.test(error.message)
              ? t("sessionNotFreshForDeletion")
              : /transfer ownership/i.test(error.message)
                ? t("deleteAccountTransferRequired")
                : t("couldNotDeleteAccount"),
        }
      )
      setConfirmOpen(false)
      const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
      window.location.assign(`${base}/${locale}/sign-in`)
    } catch {
      /* Toast reports the failure. */
    }
  }

  if (isPending) return <Skeleton className="h-32 w-full" />
  if (!session?.user) return <AuthSessionEndedNotice />

  return (
    <>
      <div className="space-y-4 rounded-lg border border-destructive/30 p-4">
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            {t("deleteAccountTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("deleteAccountSummary")}
          </p>
          <dl className="space-y-2 text-sm text-muted-foreground">
            <div>
              <dt className="font-medium text-foreground">
                {t("deleteAccountRetainedTitle")}
              </dt>
              <dd>{t("deleteAccountRetainedAccountRow")}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                {t("deleteAccountRetainedActivity")}
              </dt>
              <dd>{t("deleteAccountRetainedActivityDetail")}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                {t("deleteAccountRetainedFiles")}
              </dt>
              <dd>{t("deleteAccountRetainedFilesDetail")}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                {t("deleteAccountRetainedAvatars")}
              </dt>
              <dd>{t("deleteAccountRetainedAvatarsDetail")}</dd>
            </div>
          </dl>
        </div>
        {deleteBlocked ? (
          <div className="space-y-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <p className="font-medium text-foreground">
              {t("deleteAccountOwnedOrgBlockerTitle")}
            </p>
            <p className="text-muted-foreground">
              {t("deleteAccountOwnedOrgBlockerDescription")}
            </p>
            <ul className="space-y-2">
              {blockers.map((org) => (
                <li key={org.organizationId}>
                  <a
                    className="font-medium text-foreground underline"
                    href={org.settingsPath}
                  >
                    {t("deleteAccountTransferOwnership", { name: org.name })}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {!fresh ? (
          <p
            role="status"
            className="text-sm text-amber-700 dark:text-amber-400"
          >
            {t("sessionNotFreshForDeletion")}
          </p>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          disabled={!fresh || deleteBlocked}
          onClick={() => {
            setConfirmation("")
            setConfirmOpen(true)
          }}
        >
          {t("deleteAccount")}
        </Button>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleteAccount.isPending) setConfirmOpen(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAccountConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAccountConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 px-4">
            <Field>
              <FieldLabel htmlFor="delete-account-confirm">
                {t("typeEmailToConfirm")}
              </FieldLabel>
              <Input
                id="delete-account-confirm"
                autoComplete="off"
                value={confirmation}
                disabled={deleteAccount.isPending}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={email}
              />
            </Field>
          </div>
          <AlertDialogFooter>
            <AlertDialogClose disabled={deleteAccount.isPending}>
              {t("cancel")}
            </AlertDialogClose>
            <Button
              type="button"
              variant="destructive"
              loading={deleteAccount.isPending}
              disabled={!confirmationMatches || !fresh || deleteBlocked}
              onClick={() => void removeAccount()}
            >
              {t("deleteAccount")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
