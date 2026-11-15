"use client"

import { Checkbox } from "@packages/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@packages/ui/components/field"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { CheckboxFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"

/** Coss p-checkbox-3, 4 and 5 integrated with form state. */
export function FieldCheckbox<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  card = false,
}: CheckboxFieldProps<TValues, TName>) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || isSubmitting
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          name={field.name}
          invalid={fieldState.invalid}
          disabled={inactive}
          className="w-full"
          aria-busy={loading || undefined}
        >
          {loading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <FieldLabel
              className={
                card
                  ? "flex w-full items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50"
                  : "flex items-start gap-2"
              }
            >
              <Checkbox
                id={id}
                ref={field.ref}
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                disabled={inactive}
                readOnly={readOnly}
                aria-label={label ? undefined : name}
                aria-labelledby={label ? `${id}-label` : undefined}
                aria-required={required}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={getFieldDescribedBy(
                  id,
                  description,
                  fieldState.error?.message
                )}
              />
              <span className="flex flex-col gap-1">
                <span id={`${id}-label`}>
                  {label}
                  {required ? (
                    <span aria-hidden="true" className="text-destructive">
                      {" "}
                      {"*"}
                    </span>
                  ) : null}
                </span>
                {description ? (
                  <span
                    id={`${id}-description`}
                    className="text-xs font-normal text-muted-foreground"
                  >
                    {description}
                  </span>
                ) : null}
              </span>
            </FieldLabel>
          )}
          {loading && description ? (
            <FieldDescription id={`${id}-description`}>
              {description}
            </FieldDescription>
          ) : null}
          {fieldState.error?.message ? (
            <FieldError id={`${id}-error`} match>
              {fieldState.error.message}
            </FieldError>
          ) : null}
        </Field>
      )}
    />
  )
}
