/** Browser hints are preferences, not proof of the user's physical location. */
export interface BrowserRegionalDefaults {
  readonly region: string | null
  readonly timeZone: string | null
}

export function getBrowserRegionalDefaults(
  languages: readonly string[],
  timeZone: string | undefined
): BrowserRegionalDefaults {
  let region: string | null = null
  for (const language of languages) {
    try {
      const candidate = new Intl.Locale(language).region
      if (candidate && /^[A-Z]{2}$/.test(candidate)) {
        region = candidate
        break
      }
    } catch {
      // Try the next browser language when a tag is malformed.
    }
  }
  let validTimeZone: string | null = null
  if (
    timeZone &&
    /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/.test(timeZone)
  ) {
    try {
      new Intl.DateTimeFormat("en", { timeZone })
      validTimeZone = timeZone
    } catch {
      // A deterministic UTC fallback is used when the runtime cannot resolve it.
    }
  }
  return { region, timeZone: validTimeZone }
}

export function detectBrowserRegionalDefaults(): BrowserRegionalDefaults {
  try {
    return getBrowserRegionalDefaults(
      navigator.languages,
      new Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  } catch {
    return { region: null, timeZone: null }
  }
}
