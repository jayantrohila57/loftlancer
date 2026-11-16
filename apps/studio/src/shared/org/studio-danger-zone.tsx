"use client"

import { authClient } from "@packages/better-auth/client"
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
import { Input } from "@packages/ui/components/input"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { studioAbsolutePath } from "@/shared/org/studio-org.paths"

export function StudioDangerZone({
  organizationId,
  organizationSlug,
  isOwner,
}: {
  readonly organizationId: string
  readonly organizationSlug: string
  readonly isOwner: boolean
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [slugConfirm, setSlugConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  async function leave() {
    if (busy) return
    setBusy(true)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.leave({
            organizationId,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("couldNotLeaveOrganization")
            )
          }
          window.location.assign(studioAbsolutePath(locale, "/organizations"))
        })(),
        {
          loading: t("leavingOrganization"),
          success: t("organizationLeft"),
          error: (err: unknown) =>
            err instanceof Error ? err.message : t("couldNotLeaveOrganization"),
        }
      )
    } catch {
      setBusy(false)
    }
  }

  async function destroy() {
    if (busy || slugConfirm !== organizationSlug) return
    setBusy(true)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.delete({
            organizationId,
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("couldNotDeleteOrganization")
            )
          }
          window.location.assign(studioAbsolutePath(locale, "/onboarding"))
        })(),
        {
          loading: t("deletingOrganization"),
          success: t("organizationDeleted"),
          error: (err: unknown) =>
            err instanceof Error
              ? err.message
              : t("couldNotDeleteOrganization"),
        }
      )
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-medium">{t("leaveOrganization")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("leaveOrganizationDescription")}
        </p>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLeaveOpen(true)}
          >
            {t("leaveOrganization")}
          </Button>
        </div>
      </div>
      {isOwner ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-medium">{t("deleteOrganization")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("deleteOrganizationDescription")}
          </p>
          <div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              {t("deleteOrganization")}
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leaveOrganization")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("leaveOrganizationConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={busy}>{t("cancel")}</AlertDialogClose>
            <Button type="button" disabled={busy} onClick={() => void leave()}>
              {busy ? t("leavingOrganization") : t("leaveOrganization")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setSlugConfirm("")
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteOrganization")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteOrganizationConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {t("typeSlugToConfirm", { slug: organizationSlug })}
            </p>
            <Input
              value={slugConfirm}
              onChange={(event) => setSlugConfirm(event.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogClose disabled={busy}>{t("cancel")}</AlertDialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={busy || slugConfirm !== organizationSlug}
              onClick={() => void destroy()}
            >
              {busy ? t("deletingOrganization") : t("deleteOrganization")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
