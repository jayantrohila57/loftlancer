"use client"

import { Slider, SliderValue } from "@packages/ui/components/slider"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { SliderFieldProps } from "../../../types/form.field.types"
import { FieldShell } from "../../form.field-shell"

/** Coss slider and range slider particles with form state. */
export function FieldSlider<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  type,
  name,
  label,
  description,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  min = 0,
  max = 100,
  step = 1,
}: SliderFieldProps<TValues, TName>) {
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
          label={label}
          description={description}
          required={required}
          disabled={inactive}
          loading={loading}
          error={fieldState.error?.message}
        >
          <Slider
            id={id}
            value={
              type === "slider-range"
                ? Array.isArray(field.value)
                  ? field.value
                  : [min, max]
                : typeof field.value === "number"
                  ? field.value
                  : min
            }
            onValueChange={field.onChange}
            onValueCommitted={field.onBlur}
            min={min}
            max={max}
            step={step}
            disabled={inactive}
            aria-invalid={fieldState.invalid || undefined}
            getAriaLabel={(index) =>
              type === "slider-range"
                ? `${String(label ?? name)} ${index === 0 ? "minimum" : "maximum"}`
                : String(label ?? name)
            }
          >
            <SliderValue />
          </Slider>
        </FieldShell>
      )}
    />
  )
}
