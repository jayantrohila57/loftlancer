"use client"
import { Toggle } from "@packages/ui/components/toggle"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { ToggleFieldProps } from "../../../types/form.field.types"
import { FieldShell } from "../../form.field-shell"

/** Coss toggle particle integrated with form state. */
export function FieldToggle<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  disabled = false,
  readOnly = false,
  hidden = false,
  loading = false,
  required = false,
}: ToggleFieldProps<TValues, TName>) {
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
          description={description}
          disabled={disabled || isSubmitting}
          loading={loading}
          error={fieldState.error?.message}
        >
          <Toggle
            id={id}
            ref={field.ref}
            pressed={Boolean(field.value)}
            onPressedChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled || readOnly || isSubmitting}
            aria-label={typeof label === "string" ? label : name}
            aria-required={required}
            aria-invalid={fieldState.invalid || undefined}
            variant="outline"
          >
            {label ?? name}
          </Toggle>
        </FieldShell>
      )}
    />
  )
}
