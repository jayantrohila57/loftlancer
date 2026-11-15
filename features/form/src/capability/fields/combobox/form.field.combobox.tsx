"use client"

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@packages/ui/components/combobox"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type {
  ComboboxFieldProps,
  ComboboxOption,
} from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Coss p-combobox-1 and p-combobox-7, integrated with form state. */
export function FieldCombobox<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  optionsError,
  options,
  placeholder: placeholderProp,
  showClear = false,
  size = "default",
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: ComboboxFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const placeholder = placeholderProp ?? t("selectItem")

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  if (hidden) return null
  const inactive = disabled || isSubmitting
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
          <Combobox<ComboboxOption>
            items={options}
            value={
              options.find((item) => item.value === field.value) ??
              (typeof field.value === "string" && field.value
                ? { value: field.value, label: field.value }
                : null)
            }
            itemToStringValue={(item) => item.value}
            itemToStringLabel={(item) => item.label}
            disabled={inactive}
            readOnly={readOnly}
            onValueChange={(item) => {
              field.onChange(item?.value ?? "")
              field.onBlur()
            }}
          >
            <ComboboxInput
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
              placeholder={placeholder}
              showClear={showClear}
              clearProps={{ "aria-label": t("clearSelection") }}
              size={size}
              className="w-full"
            />
            <ComboboxPopup>
              <ComboboxEmpty>{optionsError || t("noItems")}</ComboboxEmpty>
              <ComboboxList>
                {(item: ComboboxOption) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxPopup>
          </Combobox>
        </FieldShell>
      )}
    />
  )
}
