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
import { Slider, SliderValue } from "@packages/ui/components/slider"
import { cn } from "@packages/ui/lib/utils"
import type { ReactNode } from "react"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { AppearanceScaleFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { AppearancePreviewImage } from "./form.appearance-preview-image"

function bucketQuickPickValue(values: readonly string[]): string | undefined {
  if (values.length === 0) return undefined
  return values[Math.floor(values.length / 2)]
}

/** Illustration row plus slider or step control (zoom / scale preferences). */
export function FieldAppearanceScale<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  steps,
  previewBuckets,
  control = "steps",
  sliderMin = 70,
  sliderMax = 130,
  sliderStep = 10,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: AppearanceScaleFieldProps<TValues, TName>) {
  const {
    control: formControl,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || readOnly || isSubmitting

  return (
    <Controller
      control={formControl}
      name={name}
      render={({ field, fieldState }) => {
        const currentValue = field.value ?? steps[0]?.value ?? ""
        const sliderNumeric = Number(currentValue)
        const sliderValue = Number.isFinite(sliderNumeric)
          ? sliderNumeric
          : sliderMin

        return (
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
                {required ? (
                  <span aria-hidden="true" className="text-destructive">
                    {" "}
                    {"*"}
                  </span>
                ) : null}
              </FieldsetLegend>
            ) : null}
            {loading ? (
              <Skeleton className="aspect-[286/170] w-full rounded-lg" />
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-6 overflow-x-clip">
                {previewBuckets && previewBuckets.length > 0 ? (
                  <div
                    className={cn(
                      "grid w-full min-w-0 gap-4",
                      previewBuckets.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-3"
                    )}
                  >
                    {previewBuckets.map((entry) => {
                      const quickPick = bucketQuickPickValue(entry.values)
                      return (
                        <AppearanceScaleBucket
                          key={entry.id}
                          disabled={inactive || !quickPick}
                          label={entry.label}
                          onPick={() => {
                            if (quickPick) field.onChange(quickPick)
                          }}
                        >
                          {entry.imageSrc ? (
                            <AppearancePreviewImage
                              alt={entry.imageAlt ?? entry.label}
                              className="shadow-none"
                              src={entry.imageSrc}
                            />
                          ) : null}
                        </AppearanceScaleBucket>
                      )
                    })}
                  </div>
                ) : null}

                {control === "slider" ? (
                  <div className="w-full min-w-0 overflow-x-clip">
                    <p className="mb-3 text-center text-sm font-medium tabular-nums">
                      {currentValue || `${sliderValue}`}
                      {"%"}
                    </p>
                    <Slider
                      className="min-w-0 px-2.5"
                      aria-describedby={getFieldDescribedBy(
                        id,
                        description,
                        fieldState.error?.message
                      )}
                      aria-invalid={fieldState.invalid}
                      aria-labelledby={label ? id : undefined}
                      disabled={inactive}
                      getAriaLabel={() => String(label ?? name)}
                      max={sliderMax}
                      min={sliderMin}
                      onValueChange={(value) => {
                        const next = Array.isArray(value) ? value[0] : value
                        field.onChange(String(next))
                      }}
                      onValueCommitted={field.onBlur}
                      step={sliderStep}
                      value={sliderValue}
                    >
                      <SliderValue className="sr-only" />
                    </Slider>
                    <AppearanceScaleSliderTicks
                      skipInterval={2}
                      steps={steps}
                    />
                  </div>
                ) : (
                  <RadioGroup
                    className="relative grid w-full gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
                    }}
                    value={currentValue}
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
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-3 right-4 left-4 h-px bg-border"
                    />
                    {steps.map((step, index) => (
                      <FieldItem
                        key={step.value}
                        className="flex justify-center"
                      >
                        <FieldLabel className="cursor-pointer flex-col items-center gap-2">
                          <Radio
                            className="relative z-[1] bg-background"
                            value={step.value}
                            disabled={inactive}
                            ref={index === 0 ? field.ref : undefined}
                            onBlur={field.onBlur}
                          />
                          <span className="text-xs text-muted-foreground tabular-nums not-peer-data-checked:opacity-90 peer-data-checked:font-medium peer-data-checked:text-foreground">
                            {step.label}
                          </span>
                        </FieldLabel>
                      </FieldItem>
                    ))}
                  </RadioGroup>
                )}
              </div>
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
        )
      }}
    />
  )
}

/** Coss p-slider-5 tick scale under the slider control. */
function AppearanceScaleSliderTicks({
  steps,
  skipInterval = 2,
}: {
  readonly skipInterval?: number
  readonly steps: AppearanceScaleFieldProps["steps"]
}) {
  const columnTemplate = `repeat(${String(steps.length)}, minmax(0, 1fr))`

  return (
    <fieldset
      aria-label="Zoom scale"
      className="mt-3 grid w-full min-w-0 border-0 p-0 px-2.5 text-xs font-medium text-muted-foreground"
      style={{ gridTemplateColumns: columnTemplate }}
    >
      {steps.map((step, index) => (
        <span
          className="flex min-w-0 flex-col items-center justify-center gap-2"
          key={step.value}
        >
          <span
            className={cn(
              "h-1 w-px shrink-0 bg-muted-foreground/72",
              index % skipInterval !== 0 && "h-0.5"
            )}
          />
          <span
            className={cn(
              "w-full truncate text-center tabular-nums",
              index % skipInterval !== 0 &&
                "pointer-events-none opacity-0 select-none"
            )}
          >
            {step.label}
          </span>
        </span>
      ))}
    </fieldset>
  )
}

function AppearanceScaleBucket({
  children,
  disabled,
  label,
  onPick,
}: {
  readonly children: ReactNode
  readonly disabled: boolean
  readonly label: string
  readonly onPick: () => void
}) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <button
        className={cn(
          "rounded-lg text-left transition-colors",
          disabled ? "cursor-not-allowed opacity-64" : "cursor-pointer"
        )}
        disabled={disabled}
        onClick={onPick}
        type="button"
      >
        {children}
      </button>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
