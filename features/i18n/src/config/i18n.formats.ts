import type { Formats } from "next-intl"

/** Shared by request config and the client provider; never infer currency from locale. */
export const i18nFormats = {
  dateTime: {
    short: { dateStyle: "short" },
    shortDate: { year: "numeric", month: "short", day: "numeric" },
    longDate: { dateStyle: "long" },
    time: { hour: "numeric", minute: "2-digit" },
    dateTime: { dateStyle: "medium", timeStyle: "short" },
  },
  number: {
    decimal: { maximumFractionDigits: 2 },
    integer: { maximumFractionDigits: 0 },
    percent: { style: "percent", maximumFractionDigits: 1 },
    usd: { style: "currency", currency: "USD" },
    inr: { style: "currency", currency: "INR" },
    eur: { style: "currency", currency: "EUR" },
  },
  list: {
    conjunction: { style: "long", type: "conjunction" },
    disjunction: { style: "long", type: "disjunction" },
  },
  displayName: {
    language: { type: "language", style: "long" },
    region: { type: "region", style: "long" },
  },
} satisfies Formats

/** next-intl relativeTime takes options, rather than a named global format. */
export const i18nRelativeTimeFormats = {
  long: { style: "long" },
  short: { style: "short" },
  narrow: { style: "narrow" },
} satisfies Record<string, { style: Intl.RelativeTimeFormatStyle }>

/** Deterministic SSR/client fallback; callers may supply the user's IANA time zone. */
export const defaultI18nTimeZone = "UTC"
