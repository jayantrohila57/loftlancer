"use client"

import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select"
import { useTranslations } from "next-intl"
import { Fragment, useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { GroupedSelectFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import { FieldEmpty } from "../../form.field-empty"
import { FieldShell } from "../../form.field-shell"

/** Coss p-select-6 adapted to the shared form context. */
export function FieldSelectGroup<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  optionsError,
  groups,
  placeholder: placeholderProp,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
}: GroupedSelectFieldProps<TValues, TName>) {
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
            name={field.name}
            value={field.value ?? null}
            items={groups.flatMap((group) => group.options)}
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
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectPopup>
              {!optionsError &&
              groups.every((group) => group.options.length === 0) ? (
                <FieldEmpty />
              ) : null}
              {groups.map((group, index) => (
                <Fragment key={group.label}>
                  {index > 0 ? <SelectSeparator /> : null}
                  <SelectGroup>
                    <SelectGroupLabel>{group.label}</SelectGroupLabel>
                    {group.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </Fragment>
              ))}
            </SelectPopup>
          </Select>
        </FieldShell>
      )}
    />
  )
}
