/** Form previews use an explicit currency; an unset preference has no amount. */
export function previewCurrencyOptions(currency: string) {
  return currency ? { style: "currency" as const, currency } : null
}

export function previewDateTimeOptions(
  timeZone: string,
  dateStyle: string,
  hourCycle: string
): {
  date: { dateStyle: "short" | "medium" | "long"; timeZone: string }
  time: {
    hour: "numeric"
    minute: "2-digit"
    hourCycle: "h12" | "h23" | undefined
    timeZone: string
  }
} {
  const style =
    dateStyle === "short" || dateStyle === "medium" || dateStyle === "long"
      ? dateStyle
      : "medium"
  const cycle =
    hourCycle === "h12" || hourCycle === "h23" ? hourCycle : undefined
  return {
    date: { dateStyle: style, timeZone },
    time: {
      hour: "numeric" as const,
      minute: "2-digit" as const,
      hourCycle: cycle,
      timeZone,
    },
  }
}
