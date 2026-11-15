"use client"

import { Checkbox } from "@packages/ui/components/checkbox"
import { CheckboxGroup } from "@packages/ui/components/checkbox-group"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
} from "@packages/ui/components/field"
import { Fieldset, FieldsetLegend } from "@packages/ui/components/fieldset"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { CheckboxGroupFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"

/** Coss p-checkbox-group-1, 2 and 5 integrated with form state. */
export function FieldCheckboxGroup<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  options,
  optionsError,
  selectAllLabel,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: CheckboxGroupFieldProps<TValues, TName>) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || isSubmitting
  const firstEnabled = options.findIndex((option) => !option.disabled)
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          name={field.name}
          invalid={fieldState.invalid || Boolean(optionsError)}
          disabled={inactive}
          className="w-full"
          aria-busy={loading || undefined}
          render={(props) => <Fieldset {...props} />}
        >
          <FieldsetLegend id={id} className="text-sm font-medium">
            {label ?? name}
            {required ? (
              <span aria-hidden="true" className="text-destructive">
                {" "}
                {"*"}
              </span>
            ) : null}
          </FieldsetLegend>
          {loading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : options.length === 0 ? (
            optionsError ? null : (
              <FieldEmpty />
            )
          ) : (
            <CheckboxGroup
              allValues={
                selectAllLabel
                  ? options
                      .filter((option) => !option.disabled)
                      .map((option) => option.value)
                  : undefined
              }
              value={Array.isArray(field.value) ? field.value : []}
              onValueChange={field.onChange}
              disabled={inactive}
              aria-labelledby={id}
              aria-required={required}
              aria-invalid={
                fieldState.invalid || Boolean(optionsError) || undefined
              }
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message || optionsError
              )}
            >
              {selectAllLabel ? (
                <FieldItem>
                  <FieldLabel>
                    <Checkbox
                      parent
                      disabled={inactive}
                      readOnly={readOnly}
                      aria-labelledby={`${id}-all`}
                    />
                    <span id={`${id}-all`}>{selectAllLabel}</span>
                  </FieldLabel>
                </FieldItem>
              ) : null}
              {options.map((option, index) => (
                <FieldItem
                  key={option.value}
                  className={selectAllLabel ? "ms-4" : undefined}
                >
                  <FieldLabel>
                    <Checkbox
                      value={option.value}
                      aria-labelledby={`${id}-option-${index}`}
                      disabled={inactive || option.disabled}
                      readOnly={readOnly}
                      ref={index === firstEnabled ? field.ref : undefined}
                      onBlur={field.onBlur}
                      aria-invalid={
                        fieldState.invalid || Boolean(optionsError) || undefined
                      }
                    />
                    <span id={`${id}-option-${index}`}>{option.label}</span>
                  </FieldLabel>
                </FieldItem>
              ))}
            </CheckboxGroup>
          )}
          {description ? (
            <FieldDescription id={`${id}-description`}>
              {description}
            </FieldDescription>
          ) : null}
          {fieldState.error?.message || optionsError ? (
            <FieldError id={`${id}-error`} match>
              {fieldState.error?.message || optionsError}
            </FieldError>
          ) : null}
        </Field>
      )}
    />
  )
}
