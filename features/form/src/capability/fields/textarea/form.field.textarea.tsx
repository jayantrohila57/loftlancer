"use client"

import { FieldDescription } from "@packages/ui/components/field"
import { Textarea } from "@packages/ui/components/textarea"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { TextareaFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

export function FieldTextarea<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  placeholder,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  maxLength,
}: TextareaFieldProps<TValues, TName>) {
  const t = useTranslations("ui")

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          id={id}
          label={label}
          description={description}
          required={required}
          disabled={disabled || isSubmitting}
          loading={loading}
          multiline
          error={fieldState.error?.message}
        >
          <Textarea
            {...field}
            id={id}
            value={field.value ?? ""}
            rows={3}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            readOnly={readOnly}
            aria-required={required}
            aria-invalid={fieldState.invalid}
            aria-describedby={getFieldDescribedBy(
              id,
              description,
              fieldState.error?.message,
              maxLength !== undefined ? `${id}-count` : undefined
            )}
            className="min-h-20 w-full"
          />
          {maxLength !== undefined ? (
            <FieldDescription id={`${id}-count`}>
              <span className="tabular-nums">
                {t("charactersRemaining", {
                  count: maxLength - String(field.value ?? "").length,
                })}
              </span>
            </FieldDescription>
          ) : null}
        </FieldShell>
      )}
    />
  )
}
