export type TimezoneOption = { label: string; value: string; minutes: number }

/** Build Coss-style labels and sort them by the current UTC offset. */
export function getTimezoneOptions(now: Date): TimezoneOption[] {
  return Intl.supportedValuesOf("timeZone")
    .map((timezone) => {
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      })
      const offset =
        formatter
          .formatToParts(now)
          .find((part) => part.type === "timeZoneName")?.value || ""
      const match = offset.match(/GMT([+-]?)(\d+)(?::(\d+))?/)
      const sign = match?.[1] === "-" ? -1 : 1
      const minutes =
        sign *
        (Number.parseInt(match?.[2] || "0", 10) * 60 +
          Number.parseInt(match?.[3] || "0", 10))
      return {
        label: `(${offset === "GMT" ? "GMT+0" : offset}) ${timezone.replace(/_/g, " ")}`,
        value: timezone,
        minutes,
      }
    })
    .sort((a, b) => a.minutes - b.minutes)
}
