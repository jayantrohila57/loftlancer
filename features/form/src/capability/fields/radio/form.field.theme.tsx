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
import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { ThemeFieldProps } from "../../../types/form.field.types"
import { getFieldDescribedBy } from "../../../utils/form.field"
import {
  AppearanceThemedPreview,
  appearancePreviewSelectableFrameClass,
  appearancePreviewTileClass,
} from "../appearance/form.appearance-preview-image"

/** Theme previews adapted from Coss p-radio-group-6. Form state stays in the kit. */
export function FieldTheme<
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
  panel = false,
  previewAssets,
}: ThemeFieldProps<TValues, TName>) {
  const t = useTranslations("ui")
  const label = labelProp ?? t("chooseTheme")
  const items = [
    { label: t("system"), value: "system" },
    { label: t("light"), value: "light" },
    { label: t("dark"), value: "dark" },
  ] as const

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
        <Field
          className="w-full gap-4"
          name={name}
          invalid={fieldState.invalid}
          disabled={inactive}
          render={(props) => <Fieldset {...props} />}
        >
          <FieldsetLegend
            id={id}
            className={panel ? "sr-only" : "text-sm font-medium"}
          >
            {label}
            {required ? (
              <span aria-hidden="true" className="text-destructive">
                {" "}
                {"*"}
              </span>
            ) : null}
          </FieldsetLegend>
          {loading ? (
            <Skeleton className="h-24 w-72 max-w-full" />
          ) : (
            <RadioGroup
              className={
                panel
                  ? "grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
                  : "flex flex-row flex-wrap gap-4"
              }
              value={field.value ?? ""}
              onValueChange={field.onChange}
              aria-labelledby={id}
              aria-required={required}
              aria-invalid={fieldState.invalid}
              aria-describedby={getFieldDescribedBy(
                id,
                description,
                fieldState.error?.message
              )}
            >
              {items.map((item, index) => {
                const previewId = previewAssets?.[item.value]
                return (
                  <FieldItem
                    key={item.value}
                    className={
                      panel
                        ? cn(appearancePreviewTileClass, "min-w-0")
                        : undefined
                    }
                  >
                    <FieldLabel
                      className={cn(
                        "cursor-pointer flex-col items-stretch gap-2",
                        panel && appearancePreviewTileClass
                      )}
                    >
                      <span
                        className={cn(
                          appearancePreviewSelectableFrameClass(),
                          "block w-full min-w-0"
                        )}
                      >
                        {previewId ? (
                          <AppearanceThemedPreview
                            alt={item.label}
                            palette={
                              item.value === "light" || item.value === "dark"
                                ? item.value
                                : "app"
                            }
                            src={previewId}
                          />
                        ) : (
                          themePreviews[item.value]
                        )}
                      </span>
                      <span className="flex w-full items-center gap-2">
                        <Radio
                          className="peer shrink-0"
                          value={item.value}
                          disabled={inactive}
                          ref={index === 0 ? field.ref : undefined}
                          onBlur={field.onBlur}
                        />
                        <span className="text-sm not-peer-data-checked:text-muted-foreground/72 peer-data-checked:font-medium peer-data-checked:text-foreground">
                          {item.label}
                        </span>
                      </span>
                    </FieldLabel>
                  </FieldItem>
                )
              })}
            </RadioGroup>
          )}
          {description && !panel ? (
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
      )}
    />
  )
}

const themePreviews = {
  dark: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-900" d="M0 0h88v70H0z" />
      <path
        className="fill-neutral-800 shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z"
      />
      <circle className="fill-neutral-600" cx="28" cy="26" r="8" />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="42"
      />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="49"
      />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="29"
        x="20"
        y="56"
      />
    </svg>
  ),
  light: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-200" d="M0 0h88v70H0z" />
      <path
        className="fill-white shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z"
      />
      <circle className="fill-neutral-300" cx="28" cy="26" r="8" />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="42"
      />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="49"
      />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="29"
        x="20"
        y="56"
      />
    </svg>
  ),
  system: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-200" d="M0 0h44v70H0z" />
      <path className="fill-neutral-900" d="M44 0h44v70H44z" />
      <path
        className="fill-white shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h30v62H10V12Z"
      />
      <circle className="fill-neutral-300" cx="28" cy="26" r="8" />
      <path
        className="fill-neutral-200"
        d="M20 44a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2ZM20 51a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2ZM20 58a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2Z"
      />
      <path
        className="fill-neutral-800 shadow-sm"
        d="M54 12a4 4 0 0 1 4-4h30v62H54V12Z"
      />
      <circle className="fill-neutral-600" cx="72" cy="26" r="8" />
      <path
        className="fill-neutral-700"
        d="M64 44a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2ZM64 51a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2ZM64 58a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2Z"
      />
    </svg>
  ),
} as const
