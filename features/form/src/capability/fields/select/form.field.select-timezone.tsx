"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import type { FieldValues, Path } from "react-hook-form"
import type { TimezoneSelectFieldProps } from "../../../types/form.field.types"
import type { TimezoneOption } from "../../../utils/form.timezones"
import { getTimezoneOptions } from "../../../utils/form.timezones"
import { FieldCombobox } from "../combobox/form.field.combobox"

type TimezoneState =
  | { status: "loading" }
  | { status: "ready"; options: TimezoneOption[] }
  | { status: "error" }

/** Searchable timezone field (IANA zones ordered by UTC offset). */
export function FieldSelectTimezone<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>(props: TimezoneSelectFieldProps<TValues, TName>) {
  const t = useTranslations("ui")

  const [state, setState] = useState<TimezoneState>({ status: "loading" })
  useEffect(() => {
    try {
      setState({ status: "ready", options: getTimezoneOptions(new Date()) })
    } catch {
      setState({ status: "error" })
    }
  }, [])
  const comboboxOptions =
    state.status === "ready"
      ? state.options.map((zone) => ({
          value: zone.value,
          label: zone.label,
        }))
      : []

  return (
    <FieldCombobox
      {...props}
      type="combobox"
      options={comboboxOptions}
      optionsError={
        state.status === "error" ? t("timeZonesAreUnavailable") : undefined
      }
      loading={props.loading || state.status === "loading"}
      placeholder={props.placeholder ?? t("searchTimeZone")}
    />
  )
}
