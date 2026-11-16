/** Static app segments that must not be treated as organization slugs. */
export const STUDIO_RESERVED_ORG_SLUGS = [
  "onboarding",
  "organizations",
  "invite",
  "settings",
  "api",
  "favicon",
] as const

export const STUDIO_LAST_ORG_COOKIE = "studio_last_org"

export const STUDIO_ORG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const STUDIO_ORG_SLUG_MAX_LENGTH = 48
