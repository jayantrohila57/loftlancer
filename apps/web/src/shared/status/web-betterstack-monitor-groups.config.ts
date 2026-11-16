/**
 * Maps Better Stack status page resource `public_name` values to Loftlancer
 * service groups shown on `/status`. Edit patterns when monitors are renamed.
 */
export const WEB_STATUS_SERVICE_GROUP_IDS = [
  "website",
  "auth",
  "studio",
  "console",
  "api",
] as const

export type WebStatusServiceGroupId =
  (typeof WEB_STATUS_SERVICE_GROUP_IDS)[number]

export type WebStatusMonitorGroupRule = {
  readonly id: WebStatusServiceGroupId
  /** i18n key under `statusPage.groups`. */
  readonly labelKey: string
  /** Case-insensitive substring or regex match against `public_name`. */
  readonly patterns: readonly RegExp[]
}

export const WEB_STATUS_MONITOR_GROUP_RULES: readonly WebStatusMonitorGroupRule[] =
  [
    {
      id: "auth",
      labelKey: "auth",
      patterns: [/\/auth\b/i, /\bauth\b/i],
    },
    {
      id: "studio",
      labelKey: "studio",
      patterns: [/\/studio\b/i, /\bstudio\b/i],
    },
    {
      id: "console",
      labelKey: "console",
      patterns: [/\/console\b/i, /\bconsole\b/i],
    },
    {
      id: "api",
      labelKey: "api",
      patterns: [
        /\/api\b/i,
        /\bapi\b/i,
        /\bapi\./i,
        /\/docs\b/i,
        /\bgraphql\b/i,
      ],
    },
    {
      id: "website",
      labelKey: "website",
      patterns: [
        /^loftlancer\.com\/?$/i,
        /^https:\/\/loftlancer\.com\/?$/i,
        /^www\.loftlancer\.com/i,
        /\bwebsite\b/i,
      ],
    },
  ] as const

export const WEB_BETTERSTACK_DEFAULT_STATUS_PAGE_ID = "267755"

/** Public Better Stack subdomain used when the Incidents API token is unavailable. */
export const WEB_BETTERSTACK_PUBLIC_STATUS_ORIGIN =
  "https://loftlancer.betteruptime.com"
