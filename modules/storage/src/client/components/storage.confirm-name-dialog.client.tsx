"use client"

import { FormKit } from "@features/form"
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
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

type StorageConfirmNameDialogProps = {
  open: boolean
  title: string
  description: string
  expectedName: string
  confirmLabel: string
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

function ConfirmSubmitButton({
  label,
  pending,
  expectedName,
}: {
  readonly label: string
  readonly pending: boolean
  readonly expectedName: string
}) {
  const { watch, formState } = useFormContext<{ confirmName: string }>()
  const confirmName = watch("confirmName")
  const matches = confirmName?.trim() === expectedName
  return (
    <Button
      type="submit"
      variant="destructive"
      loading={pending || formState.isSubmitting}
      disabled={pending || !matches}
    >
      {label}
    </Button>
  )
}

export function StorageConfirmNameDialog({
  open,
  title,
  description,
  expectedName,
  confirmLabel,
  pending = false,
  onOpenChange,
  onConfirm,
}: StorageConfirmNameDialogProps) {
  const t = useTranslations("ui")
  const schema = useMemo(
    () =>
      z.object({
        confirmName: z
          .string()
          .trim()
          .refine((value) => value === expectedName, {
            message: t("storageConfirmNameMismatch"),
          }),
      }),
    [expectedName, t]
  )

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next)
      }}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <FormKit
          key={open ? expectedName : "closed"}
          variant="embedded"
          schema={schema}
          defaultValues={{ confirmName: "" }}
          onSubmit={async () => {
            await onConfirm()
          }}
        >
          <div className="space-y-4 px-4">
            <FormKit.Field
              name="confirmName"
              type="text"
              label={t("storageTypeFileNameToConfirm")}
              placeholder={expectedName}
              disabled={pending}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogClose disabled={pending}>
              {t("cancel")}
            </AlertDialogClose>
            <FormKit.Actions className="p-0">
              <ConfirmSubmitButton
                label={confirmLabel}
                pending={pending}
                expectedName={expectedName}
              />
            </FormKit.Actions>
          </AlertDialogFooter>
        </FormKit>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
