"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/ui/components/avatar"
import { Button } from "@packages/ui/components/button"
import { Field, FieldError, FieldLabel } from "@packages/ui/components/field"
import { Camera, Trash2, Upload, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useRef } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import { useAvatarUpload } from "../../../hooks/form.use-avatar-upload"
import type { AvatarUploadFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

export function FieldAvatarUpload<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  heading,
  layout = "inline",
  upload,
  afterUpload,
  afterClear,
  disabled,
  required,
}: AvatarUploadFieldProps<TValues, TName>) {
  const t = useTranslations("ui")

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const { uploadFile, pending, error } = useAvatarUpload(upload)
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const inactive = disabled || isSubmitting || pending

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value =
          typeof field.value === "string" && field.value ? field.value : ""
        const shellError = fieldState.error?.message ?? error ?? undefined

        async function handleFileChange(file: File) {
          const url = await uploadFile(file)
          if (!url) return
          const previous = value
          field.onChange(url)
          try {
            await afterUpload?.(url)
          } catch {
            field.onChange(previous)
          }
        }

        async function clearImage() {
          const previous = value
          field.onChange("")
          try {
            await afterClear?.()
          } catch {
            field.onChange(previous)
          }
        }

        if (layout === "profile") {
          const hint = description ?? t("pNGJPEGWebPAndGIFUpTo5MB")
          const fieldLabel = label ?? heading
          const describedBy = getFieldDescribedBy(
            id,
            hint,
            shellError,
            pending ? `${id}-status` : undefined
          )
          return (
            <Field
              className="w-full"
              invalid={Boolean(shellError)}
              disabled={inactive}
              aria-busy={pending || undefined}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <Avatar className="size-24 rounded-full border bg-muted">
                    {value ? (
                      <AvatarImage
                        src={value}
                        alt={t("avatarPreview")}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-full bg-muted">
                      <UserRound
                        className="size-10 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="space-y-1">
                    {fieldLabel ? (
                      <FieldLabel
                        id={`${id}-label`}
                        htmlFor={id}
                        className="text-base font-semibold"
                      >
                        {fieldLabel}
                      </FieldLabel>
                    ) : null}
                    <p
                      id={`${id}-description`}
                      className="text-sm text-muted-foreground"
                    >
                      {hint}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      loading={pending}
                      disabled={inactive}
                      aria-labelledby={fieldLabel ? `${id}-label` : undefined}
                      onClick={() => inputRef.current?.click()}
                    >
                      <Upload className="size-4" aria-hidden="true" />
                      {t("upload")}
                    </Button>
                    {value ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("removeProfilePicture")}
                        disabled={inactive}
                        onClick={() => void clearImage()}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                  {pending ? (
                    <p
                      id={`${id}-status`}
                      className="text-xs text-muted-foreground"
                      role="status"
                    >
                      {t("uploadingImage")}
                    </p>
                  ) : null}
                </div>
              </div>
              <input
                id={id}
                ref={inputRef}
                type="file"
                className="sr-only"
                tabIndex={-1}
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={inactive}
                required={required || undefined}
                aria-invalid={Boolean(shellError) || undefined}
                aria-labelledby={fieldLabel ? `${id}-label` : undefined}
                aria-describedby={describedBy}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void handleFileChange(file)
                }}
              />
              {shellError ? (
                <FieldError id={`${id}-error`} match={true}>
                  {shellError}
                </FieldError>
              ) : null}
            </Field>
          )
        }

        return (
          <FieldShell
            id={id}
            label={label}
            description={description}
            required={required}
            error={shellError}
          >
            <div className="relative w-fit">
              <button
                type="button"
                aria-label={value ? t("changeImage") : t("uploadImage")}
                disabled={inactive}
                onClick={() => inputRef.current?.click()}
                className="group relative flex size-20 items-center justify-center overflow-hidden rounded-lg border bg-muted transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              >
                <Avatar className="size-full rounded-lg">
                  {value ? (
                    <AvatarImage
                      src={value}
                      alt={t("avatarPreview")}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    <Camera className="size-5" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              </button>
              {value ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  aria-label={t("removeImage")}
                  disabled={inactive}
                  onClick={() => void clearImage()}
                  className="absolute -top-2 -right-2 rounded-full border border-border bg-background text-foreground shadow hover:bg-accent"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
            <input
              id={id}
              ref={inputRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={inactive}
              onBlur={field.onBlur}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) void handleFileChange(file)
              }}
            />
            {pending ? <span role="status">{t("uploadingImage")}</span> : null}
          </FieldShell>
        )
      }}
    />
  )
}
