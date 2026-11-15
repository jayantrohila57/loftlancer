"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "@packages/ui/components/combobox"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type {
  ComboboxOption,
  MultipleComboboxFieldProps,
} from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Coss p-combobox-9, with selected values stored as a string array. */
export function FieldComboboxMultiple<
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
}: MultipleComboboxFieldProps<TValues, TName>) {
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
      render={({ field, fieldState }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : []
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
            <Combobox<ComboboxOption, true>
              multiple
              items={options}
              value={values.flatMap((value) => {
                const item = options.find((option) => option.value === value)
                return [item ?? { value, label: value }]
              })}
              itemToStringValue={(item) => item.value}
              itemToStringLabel={(item) => item.label}
              disabled={inactive}
              readOnly={readOnly}
              onValueChange={(items) => {
                field.onChange(items.map((item) => item.value))
                field.onBlur()
              }}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {(selected: ComboboxOption[]) => (
                    <>
                      {selected.map((item) => (
                        <ComboboxChip
                          key={item.value}
                          aria-label={item.label}
                          removeProps={{ "aria-label": `Remove ${item.label}` }}
                        >
                          {item.label}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        id={id}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        aria-required={required}
                        aria-invalid={
                          fieldState.invalid ||
                          Boolean(optionsError) ||
                          undefined
                        }
                        aria-describedby={getFieldDescribedBy(
                          id,
                          description,
                          fieldState.error?.message || optionsError
                        )}
                        placeholder={selected.length ? undefined : placeholder}
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
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
        )
      }}
    />
  )
}
