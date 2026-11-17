/** Locale-free account path redirects (see `apps/auth/next.config.ts`). */
export const AUTH_ACCOUNT_LEGACY_REDIRECTS = [
  ["/account/overview", "/account"],
  ["/account/activity", "/account/security/user-activity"],
  ["/account/activity/account", "/account/security/user-activity"],
  ["/account/activity/security", "/account/security/activity"],
  ["/account/activity/resource", "/account/security/activity"],
  [
    "/account/activity/data-management",
    "/account/security/user-activity/data-management",
  ],
  ["/account/permissions", "/account/security/permissions"],
] as const
