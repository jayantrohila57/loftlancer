"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
} from "@packages/ui/components/field"
import { Fieldset, FieldsetLegend } from "@packages/ui/components/fieldset"
import { Radio, RadioGroup } from "@packages/ui/components/radio-group"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { RadioGroupFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"

/** Coss radio group basic, description and card particles with form state. */
export function FieldRadioGroup<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  options,
  optionsError,
  card = false,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: RadioGroupFieldProps<TValues, TName>) {
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
            <RadioGroup
              name={field.name}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={inactive}
              className={card ? "w-full min-w-0" : undefined}
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
              {options.map((option, index) => (
                <FieldItem
                  key={option.value}
                  className={card ? "w-full min-w-0" : undefined}
                >
                  <FieldLabel
                    className={
                      card
                        ? "flex w-full min-w-0 items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50"
                        : "flex items-start gap-2"
                    }
                  >
                    <Radio
                      value={option.value}
                      disabled={inactive || readOnly || option.disabled}
                      ref={index === firstEnabled ? field.ref : undefined}
                      onBlur={field.onBlur}
                      aria-labelledby={`${id}-option-${index}`}
                      aria-describedby={
                        option.description
                          ? `${id}-option-description-${index}`
                          : undefined
                      }
                      aria-invalid={
                        fieldState.invalid || Boolean(optionsError) || undefined
                      }
                    />
                    <span className="flex flex-col gap-1">
                      <span id={`${id}-option-${index}`}>{option.label}</span>
                      {option.description ? (
                        <span
                          id={`${id}-option-description-${index}`}
                          className="text-xs font-normal text-muted-foreground"
                        >
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </FieldLabel>
                </FieldItem>
              ))}
            </RadioGroup>
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
