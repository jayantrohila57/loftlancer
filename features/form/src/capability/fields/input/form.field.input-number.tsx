"use client"

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@packages/ui/components/number-field"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { NumberInputFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Stores a number or null. Currency formatting changes presentation only. */
export function FieldNumber<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  type,
  name,
  label,
  description,
  placeholder,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  min,
  max,
  step,
  currency = "USD",
  precision = 2,
}: NumberInputFieldProps<TValues, TName>) {
  const t = useTranslations("ui")

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || isSubmitting
  const isCurrency = type === "currency"
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
          disabled={inactive}
          loading={loading}
          error={fieldState.error?.message}
        >
          <NumberField
            id={id}
            name={field.name}
            value={typeof field.value === "number" ? field.value : null}
            onValueChange={(value) => field.onChange(value)}
            min={min}
            max={max}
            step={step ?? (isCurrency ? 10 ** -precision : 1)}
            disabled={inactive}
            readOnly={readOnly}
            required={required}
            format={
              isCurrency
                ? {
                    style: "currency",
                    currency,
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision,
                  }
                : undefined
            }
          >
            <NumberFieldGroup>
              <NumberFieldDecrement
                disabled={inactive || readOnly}
                aria-label={t("decrease")}
              />
              <NumberFieldInput
                id={id}
                ref={field.ref}
                onBlur={field.onBlur}
                placeholder={placeholder}
                aria-required={required}
                aria-invalid={fieldState.invalid}
                aria-describedby={getFieldDescribedBy(
                  id,
                  description,
                  fieldState.error?.message
                )}
              />
              <NumberFieldIncrement
                disabled={inactive || readOnly}
                aria-label={t("increase")}
              />
            </NumberFieldGroup>
          </NumberField>
        </FieldShell>
      )}
    />
  )
}
