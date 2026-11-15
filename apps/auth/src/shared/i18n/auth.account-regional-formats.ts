import { defaultI18nTimeZone, i18nFormats } from "@features/i18n/formats"
import type { Formats } from "next-intl"

export type AccountRegionalFormatInput = Readonly<{
  hourCycle?: "h12" | "h23" | null
  dateStyle?: "short" | "medium" | "long" | null
  numberGrouping?: "auto" | "never" | null
  timeZone?: string | null
}>

/** Merges saved account regional prefs into shared next-intl format presets. */
export function buildAccountRegionalFormats(
  data: AccountRegionalFormatInput | undefined
): Formats {
  const hourCycle = data?.hourCycle ?? undefined
  const dateStyle = data?.dateStyle ?? undefined
  const useGrouping = data?.numberGrouping === "never" ? false : undefined
  return {
    ...i18nFormats,
    dateTime: {
      ...i18nFormats.dateTime,
      ...(dateStyle
        ? {
            short: { dateStyle },
            shortDate: { dateStyle },
            longDate: { dateStyle },
            dateTime: { dateStyle, timeStyle: "short", hourCycle },
          }
        : { dateTime: { ...i18nFormats.dateTime.dateTime, hourCycle } }),
      time: { ...i18nFormats.dateTime.time, hourCycle },
    },
    number: {
      ...i18nFormats.number,
      decimal: { ...i18nFormats.number.decimal, useGrouping },
      integer: { ...i18nFormats.number.integer, useGrouping },
      percent: { ...i18nFormats.number.percent, useGrouping },
    },
  }
}

export function resolveAccountRegionalTimeZone(
  data: AccountRegionalFormatInput | undefined,
  browserTimeZone?: string | null
) {
  return data?.timeZone ?? browserTimeZone ?? defaultI18nTimeZone
}
