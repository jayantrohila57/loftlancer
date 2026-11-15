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
import { cn } from "@packages/ui/lib/utils"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { VisualRadioFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import {
  appearancePreviewSelectableFrameClass,
  appearancePreviewTileClass,
} from "./form.appearance-preview-image"

/** Card-style radio row for a small set of choices with custom previews. */
export function FieldVisualRadio<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  options,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: VisualRadioFieldProps<TValues, TName>) {
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
        <Field
          className="w-full gap-4"
          name={name}
          invalid={fieldState.invalid}
          disabled={inactive}
          render={(props) => <Fieldset {...props} />}
        >
          {label ? (
            <FieldsetLegend id={id} className="sr-only">
              {label}
            </FieldsetLegend>
          ) : null}
          {loading ? (
            <Skeleton className="h-28 w-full rounded-lg" />
          ) : (
            <RadioGroup
              className={cn(
                "grid w-full justify-items-start gap-4",
                options.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
              )}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              aria-labelledby={label ? id : undefined}
              aria-required={required}
              aria-invalid={fieldState.invalid}
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message
              )}
            >
              {options.map((option, index) => (
                <FieldItem
                  key={option.value}
                  className={appearancePreviewTileClass}
                >
                  <FieldLabel
                    className={`cursor-pointer flex-col items-start gap-2 ${appearancePreviewTileClass}`}
                  >
                    <span
                      className={cn(
                        appearancePreviewSelectableFrameClass(),
                        "block w-full"
                      )}
                    >
                      {option.preview}
                    </span>
                    <span className="flex w-full items-center gap-2">
                      <Radio
                        className="peer shrink-0"
                        value={option.value}
                        disabled={inactive || option.disabled}
                        ref={index === 0 ? field.ref : undefined}
                        onBlur={field.onBlur}
                      />
                      <span className="text-sm not-peer-data-checked:text-muted-foreground peer-data-checked:font-medium peer-data-checked:text-foreground">
                        {option.label}
                      </span>
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
          {fieldState.error?.message ? (
            <FieldError id={`${id}-error`} match={true}>
              {fieldState.error.message}
            </FieldError>
          ) : null}
        </Field>
      )}
    />
  )
}
