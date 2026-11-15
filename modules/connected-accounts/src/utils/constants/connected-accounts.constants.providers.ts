export const CONNECTED_ACCOUNT_PROVIDERS = ["google", "github"] as const

/** OAuth providers shown in the v2 sign-in method inventory (GitHub only until others are approved). */
export const ACTIVE_SIGN_IN_OAUTH_PROVIDERS = ["github"] as const

export const CONNECTED_ACCOUNT_PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub",
} as const
