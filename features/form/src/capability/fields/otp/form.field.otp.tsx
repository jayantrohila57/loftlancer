"use client"

import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@packages/ui/components/otp-field"
import { useTranslations } from "next-intl"
import { Fragment, useEffect, useId, useRef, useState } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { OtpFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Adapts Coss p-otp-field-1, 2, 3, 8, 9 and 10 to the form context. */
export function FieldOtp<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label: labelProp,
  description,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  length = 6,
  size = "default",
  separator = false,
  mask = false,
  validationType = "numeric",
  placeholder,
  normalizeValue,
  validateOnComplete = false,
}: OtpFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const label = labelProp ?? t("oneTimePassword")
  const {
    control,
    clearErrors,
    trigger,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [invalidPulse, setInvalidPulse] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const invalidTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipClear = useRef(false)
  useEffect(
    () => () => {
      if (invalidTimeout.current !== null) clearTimeout(invalidTimeout.current)
    },
    []
  )
  if (hidden) return null
  const inactive = disabled || isSubmitting
  const slotCount = Math.max(1, Math.floor(length))
  const slotKeys = Array.from(
    { length: slotCount },
    (_, index) => `otp-slot-${index}`
  )
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
          <OTPField
            id={id}
            length={slotCount}
            size={size}
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={(value) => {
              field.onChange(value)
              if (skipClear.current) skipClear.current = false
              else {
                if (invalidTimeout.current !== null)
                  clearTimeout(invalidTimeout.current)
                setInvalidPulse(0)
                setStatusMessage("")
              }
              if (validateOnComplete) {
                if (value.length === slotCount) void trigger(name)
                else clearErrors(name)
              }
            }}
            onValueInvalid={(value) => {
              if (!normalizeValue) return
              skipClear.current = true
              setInvalidPulse((current) => current + 1)
              setStatusMessage(
                `Unsupported characters were ignored from ${value}.`
              )
              if (invalidTimeout.current !== null)
                clearTimeout(invalidTimeout.current)
              invalidTimeout.current = setTimeout(() => {
                invalidTimeout.current = null
                setInvalidPulse(0)
              }, 400)
            }}
            disabled={inactive}
            readOnly={readOnly}
            mask={mask}
            validationType={validationType}
            normalizeValue={normalizeValue}
            required={required}
          >
            {slotKeys.map((slotKey, index) => (
              <Fragment key={slotKey}>
                {separator && index === Math.ceil(slotCount / 2) ? (
                  <OTPFieldSeparator />
                ) : null}
                <OTPFieldInput
                  ref={index === 0 ? field.ref : undefined}
                  onBlur={field.onBlur}
                  aria-label={
                    index === 0
                      ? undefined
                      : `Character ${index + 1} of ${slotCount}`
                  }
                  onFocus={() => setFocusedIndex(index)}
                  aria-invalid={
                    fieldState.invalid ||
                    (invalidPulse > 0 && focusedIndex === index) ||
                    undefined
                  }
                  aria-describedby={getFieldDescribedBy(
                    id,
                    description,
                    fieldState.error?.message
                  )}
                  placeholder={placeholder}
                  className={
                    placeholder
                      ? "placeholder:text-muted-foreground focus-visible:placeholder:text-transparent"
                      : undefined
                  }
                />
              </Fragment>
            ))}
          </OTPField>
          {normalizeValue ? (
            <span aria-live="polite" className="sr-only">
              {statusMessage}
            </span>
          ) : null}
        </FieldShell>
      )}
    />
  )
}
