"use client"

import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { MultipleSelectFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"
import { FieldShell } from "../../form.field-shell"

/** Coss p-select-7 adapted to the shared form context. */
export function FieldSelectMultiple<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  optionsError,
  options,
  placeholder: placeholderProp,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: MultipleSelectFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const placeholder = placeholderProp ?? t("select")

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
          error={fieldState.error?.message || optionsError}
        >
          <Select
            multiple
            value={Array.isArray(field.value) ? field.value : []}
            disabled={inactive}
            onValueChange={(value) => {
              field.onChange(value)
              field.onBlur()
            }}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-required={required}
              aria-invalid={fieldState.invalid || Boolean(optionsError)}
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message || optionsError
              )}
              className="w-full"
            >
              <SelectValue>
                {(selected: string[]) =>
                  selected.length === 0 ? (
                    placeholder
                  ) : (
                    <>
                      {options.find((option) => option.value === selected[0])
                        ?.label ?? selected[0]}
                      {selected.length > 1
                        ? ` (+${selected.length - 1} more)`
                        : ""}
                    </>
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {options.length === 0 && !optionsError ? <FieldEmpty /> : null}
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </FieldShell>
      )}
    />
  )
}
