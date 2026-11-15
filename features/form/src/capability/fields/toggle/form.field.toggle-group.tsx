"use client"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@packages/ui/components/toggle-group"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { ToggleGroupFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"
import { FieldShell } from "../../form.field-shell"

/** Coss toggle group particle; stores an array of selected option values. */
export function FieldToggleGroup<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  options,
  optionsError,
  disabled = false,
  readOnly = false,
  hidden = false,
  loading = false,
  required = false,
}: ToggleGroupFieldProps<TValues, TName>) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || readOnly || isSubmitting
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          id={id}
          description={description}
          disabled={inactive}
          loading={loading}
          error={fieldState.error?.message || optionsError}
        >
          <span id={id} className="text-sm font-medium">
            {label ?? name}
            {required ? (
              <span aria-hidden="true" className="text-destructive">
                {" "}
                {"*"}
              </span>
            ) : null}
          </span>
          {options.length === 0 ? (
            optionsError ? null : (
              <FieldEmpty />
            )
          ) : (
            <ToggleGroup
              multiple
              value={Array.isArray(field.value) ? field.value : []}
              onValueChange={field.onChange}
              disabled={inactive}
              aria-labelledby={id}
              aria-invalid={
                fieldState.invalid || Boolean(optionsError) || undefined
              }
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message || optionsError
              )}
              variant="outline"
            >
              {options.map((option, index) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  disabled={inactive || option.disabled}
                  ref={index === 0 ? field.ref : undefined}
                  onBlur={field.onBlur}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FieldShell>
      )}
    />
  )
}
