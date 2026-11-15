"use client"

import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@packages/ui/components/autocomplete"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type {
  AutocompleteFieldProps,
  ComboboxOption,
} from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Coss p-autocomplete-1, 2, 3, 4, 7, 8 and 9, adapted to form state. */
export function FieldAutocomplete<
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
  showTrigger = false,
  autoHighlight = false,
  size = "default",
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: AutocompleteFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const placeholder = placeholderProp ?? t("searchItems")

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
          <Autocomplete
            items={options}
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
            itemToStringValue={(item: ComboboxOption) => item.label}
            autoHighlight={autoHighlight}
            disabled={inactive}
            readOnly={readOnly}
          >
            <AutocompleteInput
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              readOnly={readOnly}
              aria-required={required}
              aria-invalid={
                fieldState.invalid || Boolean(optionsError) || undefined
              }
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message || optionsError
              )}
              placeholder={placeholder}
              showClear={showClear && !readOnly}
              showTrigger={showTrigger}
              clearProps={{ "aria-label": "Clear input" }}
              size={size}
              className="w-full"
            />
            <AutocompletePopup>
              <AutocompleteEmpty>
                {optionsError || t("noItems")}
              </AutocompleteEmpty>
              <AutocompleteList>
                {(item: ComboboxOption) => (
                  <AutocompleteItem
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompletePopup>
          </Autocomplete>
        </FieldShell>
      )}
    />
  )
}
