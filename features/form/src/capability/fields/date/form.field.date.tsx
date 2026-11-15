"use client"
import { Button } from "@packages/ui/components/button"
import { Calendar } from "@packages/ui/components/calendar"
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@packages/ui/components/popover"
import { CalendarIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useId, useState } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { DateFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Coss date picker particle, storing a Date or undefined. */
export function FieldDate<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  placeholder: placeholderProp,
  disabled = false,
  readOnly = false,
  hidden = false,
  loading = false,
  required = false,
}: DateFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const placeholder = placeholderProp ?? t("pickDate")

  const format = useFormatter()
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  const [open, setOpen] = useState(false)
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  id={id}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  variant="outline"
                  disabled={inactive}
                  aria-invalid={fieldState.invalid || undefined}
                  aria-required={required}
                  aria-describedby={getFieldDescribedBy(
                    id,
                    description,
                    fieldState.error?.message
                  )}
                  className="w-full justify-start font-normal"
                />
              }
            >
              <CalendarIcon aria-hidden="true" />
              {(field.value as unknown) instanceof Date &&
              !Number.isNaN((field.value as Date).getTime())
                ? format.dateTime(field.value, "shortDate")
                : placeholder}
            </PopoverTrigger>
            <PopoverPopup align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  (field.value as unknown) instanceof Date
                    ? (field.value as Date)
                    : undefined
                }
                onSelect={(value) => {
                  field.onChange(value)
                  setOpen(false)
                }}
              />
            </PopoverPopup>
          </Popover>
        </FieldShell>
      )}
    />
  )
}
