"use client"

import type { ComboboxOption } from "@features/form"
import { FormKit, getTimezoneOptions } from "@features/form"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useBrowserRegionalDefaults } from "../hooks/regional-preferences.browser-defaults.client"

export function RegionalTimezoneField({
  description,
  label,
  notSetLabel,
  placeholder,
}: {
  readonly description?: ReactNode
  readonly label: ReactNode
  readonly notSetLabel: string
  readonly placeholder: string
}) {
  const tUi = useTranslations("ui")
  const browserDefaults = useBrowserRegionalDefaults()
  const [options, setOptions] = useState<ComboboxOption[]>([
    { value: "", label: notSetLabel },
  ])
  const [loading, setLoading] = useState(true)
  const [optionsError, setOptionsError] = useState<string | undefined>()

  useEffect(() => {
    try {
      const zones = getTimezoneOptions(new Date()).map((zone) => ({
        value: zone.value,
        label: zone.label,
      }))
      const browserZone = browserDefaults?.timeZone
      setOptions([
        { value: "", label: notSetLabel },
        { value: "UTC", label: "UTC" },
        ...(browserZone &&
        browserZone !== "UTC" &&
        !zones.some((zone) => zone.value === browserZone)
          ? [{ value: browserZone, label: browserZone.replaceAll("_", " ") }]
          : []),
        ...zones.filter((zone) => zone.value !== "UTC"),
      ])
    } catch {
      setOptionsError(tUi("timeZonesAreUnavailable"))
    } finally {
      setLoading(false)
    }
  }, [browserDefaults?.timeZone, notSetLabel, tUi])

  return (
    <FormKit.Field
      type="combobox"
      name="value"
      showClear
      loading={loading}
      label={label}
      description={description}
      options={options}
      optionsError={optionsError}
      placeholder={placeholder}
    />
  )
}
