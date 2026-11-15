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
import type { RichSelectFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"
import { FieldShell } from "../../form.field-shell"

/** Adapts Coss p-select-8, 9, 14, 15, 16, 17, 19, 20 and 21. */
export function FieldSelectRich<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  optionsError,
  options,
  placeholder: placeholderProp,
  prefix,
  icon,
  pill = false,
  autoWidth = false,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: RichSelectFieldProps<TValues, TName>) {
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
            value={
              options.find((item) => item.value === field.value) ??
              (typeof field.value === "string" && field.value
                ? { value: field.value, label: field.value }
                : null)
            }
            itemToStringValue={(item) => item.value}
            disabled={inactive}
            onValueChange={(item) => {
              field.onChange(item?.value ?? "")
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
              className={`${autoWidth ? "w-fit min-w-0" : "w-full"} ${pill ? "[--radius-lg:9999px] [--radius:9999px]" : ""}`}
            >
              {icon}
              <SelectValue placeholder={placeholder}>
                {(item) =>
                  item ? (
                    <span className="flex items-center gap-2">
                      {prefix ? (
                        <span className="text-muted-foreground">{prefix}</span>
                      ) : null}
                      {item.icon}
                      <span className="flex flex-col text-start">
                        <span className="truncate">{item.label}</span>
                        {item.description ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  ) : (
                    placeholder
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {options.length === 0 && !optionsError ? <FieldEmpty /> : null}
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    <span className="flex flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </FieldShell>
      )}
    />
  )
}
