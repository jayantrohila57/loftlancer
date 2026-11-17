"use client"

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
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useChangeAccountEmail } from "../../hooks/profile.hook.change-email"

export function ProfileAccountPersonalEmailChange({
  currentEmail,
}: {
  readonly currentEmail: string
}) {
  const t = useTranslations("ui")
  const changeEmail = useChangeAccountEmail()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(currentEmail)

  async function submit() {
    const normalized = draft.trim().toLowerCase()
    if (!normalized || normalized === currentEmail.trim().toLowerCase()) {
      toastManager.add({
        title: t("emailChangeSameAddress"),
        type: "error",
      })
      return
    }
    try {
      await toastManager.promise(changeEmail.mutateAsync(normalized), {
        loading: t("savingProfile"),
        success: t("emailChangeVerificationSent"),
        error: t("emailChangeFailed"),
      })
      setOpen(false)
    } catch {
      // Toast reports failure.
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {t("changeEmailAddress")}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("changeEmailDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("changeEmailDialogDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="profile-new-email">
              {t("newEmailAddress")}
            </FieldLabel>
            <Input
              id="profile-new-email"
              type="email"
              autoComplete="email"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={changeEmail.isPending}
                />
              }
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button
              type="button"
              disabled={changeEmail.isPending}
              onClick={() => void submit()}
            >
              {changeEmail.isPending
                ? t("savingProfile")
                : t("changeEmailAddress")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
