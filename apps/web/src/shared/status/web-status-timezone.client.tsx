"use client"

import { defaultI18nTimeZone } from "@features/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select"
import { useFormatter } from "next-intl"
import { useEffect, useState } from "react"

const STORAGE_KEY = "loftlancer.status.timezone"

export const WEB_STATUS_TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "EST" },
  { value: "America/Chicago", label: "CST" },
  { value: "America/Denver", label: "MST" },
  { value: "America/Los_Angeles", label: "PST" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "GMT" },
  { value: "Europe/Paris", label: "CET" },
  { value: "Asia/Kolkata", label: "IST" },
  { value: "Asia/Tokyo", label: "JST" },
] as const

type WebStatusTimezoneSelectInput = {
  readonly options: typeof WEB_STATUS_TIMEZONE_OPTIONS
}

export function WebStatusTimezoneSelect({
  options,
}: WebStatusTimezoneSelectInput) {
  const [value, setValue] = useState("UTC")

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const resolved = stored && stored.length > 0 ? stored : defaultI18nTimeZone
    setValue(resolved)
    document.documentElement.dataset.statusTimezone = resolved
  }, [])

  return (
    <Select
      onValueChange={(next) => {
        if (!next) return
        setValue(next)
        window.localStorage.setItem(STORAGE_KEY, next)
        document.documentElement.dataset.statusTimezone = next
        window.dispatchEvent(
          new CustomEvent("loftlancer:status-timezone", { detail: next })
        )
      }}
      value={value}
    >
      <SelectTrigger className="h-9 w-[7.5rem]" size="sm">
        <SelectValue placeholder="UTC" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function useStatusTimezone(): string {
  const [timezone, setTimezone] = useState(defaultI18nTimeZone)

  useEffect(() => {
    const read = () =>
      document.documentElement.dataset.statusTimezone ?? defaultI18nTimeZone
    setTimezone(read())

    const onChange = (event: Event) => {
      const custom = event as CustomEvent<string>
      setTimezone(custom.detail || read())
    }
    window.addEventListener("loftlancer:status-timezone", onChange)
    return () =>
      window.removeEventListener("loftlancer:status-timezone", onChange)
  }, [])

  return timezone
}

export function WebStatusUpdatedAt({
  isoDate,
  prefix,
  emptyLabel,
}: {
  readonly isoDate: string | null
  readonly prefix: string
  readonly emptyLabel: string
}) {
  const timezone = useStatusTimezone()
  const format = useFormatter()

  if (!isoDate) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  const formatted = format.dateTime(new Date(isoDate), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  })

  return (
    <p className="text-sm text-muted-foreground">
      {prefix} {formatted}
    </p>
  )
}
