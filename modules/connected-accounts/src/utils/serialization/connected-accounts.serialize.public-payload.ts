/** Keys allowed on browser-facing linked-account list payloads. */
export const LINKED_CONNECTED_ACCOUNT_PUBLIC_KEYS = [
  "id",
  "providerId",
  "createdAt",
] as const

/** Must never appear in list, link, or provider-availability API responses. */
export const FORBIDDEN_CONNECTED_ACCOUNT_RESPONSE_KEYS = [
  "accountId",
  "accessToken",
  "refreshToken",
  "idToken",
  "clientId",
  "clientSecret",
  "password",
  "scope",
  "scopes",
  "userId",
] as const

export type ForbiddenConnectedAccountResponseKey =
  (typeof FORBIDDEN_CONNECTED_ACCOUNT_RESPONSE_KEYS)[number]
