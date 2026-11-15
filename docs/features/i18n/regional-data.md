# Regional data and automatic defaults

- Locale-sensitive display names, number formats, and dates use the runtime's
  `Intl`/ICU data through next-intl. Locale routing continues to use the app's
  supported locale tuple and next-intl's existing detection and locale cookie.
- The account API validates region and currency codes using a checked-in
  `iso-codes` 4.20.1 snapshot. The ISO 3166 and ISO 4217 standards and Unicode
  CLDR are the authoritative references; refresh and review this snapshot as
  their maintained lists change. Runtime currency data may differ by version.
- The shared client provider reads the browser's configured IANA time-zone name
  when no time zone is supplied. The Auth account provider gives a saved time
  zone precedence over that automatic value. A browser
  language tag's explicit region is used as an automatic region hint. These
  values are device preferences and do not establish physical location.
- UTC is the deterministic rendering fallback. Browser time-zone detection
  runs after hydration; the request-side provider is not yet connected to the
  account setting, and the Console, Studio, and Web providers do not yet read
  account preferences. Server and client can therefore display different
  values after the Auth client resolves its preference.
- Currency is never derived from language or region, and transaction amounts
  retain their own ISO currency. An unset currency has no currency preview.
  Region and measurement choices are stored but are not yet applied to all
  application formatting and unit consumers. Full policy: [currency and
  measurements](./currency-and-measurements.md).
- Browser geolocation remains a separate permission-based capability. No IP
  geolocation, reverse-geocoding service, or location-to-currency mapping is
  used by these account settings.
- Formatting consumer inventory and confirmed date/time and number choices:
  [../../work/regional-formatting-inventory.md](../../work/regional-formatting-inventory.md).
