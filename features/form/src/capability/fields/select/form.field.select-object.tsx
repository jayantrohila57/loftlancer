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
import type { ObjectSelectFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"
import { FieldShell } from "../../form.field-shell"

/** Coss p-select-10 with the selected object preserved in form state. */
export function FieldSelectObject<
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
}: ObjectSelectFieldProps<TValues, TName>) {
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
      render={({ field, fieldState }) => {
        const selected =
          options.find((item) => item.value === field.value?.value) ?? null
        return (
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
              value={selected}
              itemToStringValue={(item) => item.value}
              disabled={inactive}
              onValueChange={(item) => {
                field.onChange(item)
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
                className="w-full py-1"
              >
                <SelectValue placeholder={placeholder}>
                  {(item) =>
                    item ? (
                      <span className="flex flex-col">
                        <span className="truncate">{item.label}</span>
                        {item.description ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      placeholder
                    )
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectPopup>
                {options.length === 0 && !optionsError ? <FieldEmpty /> : null}
                {options.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                  >
                    <span className="flex flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </FieldShell>
        )
      }}
    />
  )
}
