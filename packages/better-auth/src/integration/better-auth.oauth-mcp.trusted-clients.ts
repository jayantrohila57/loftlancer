import { serverEnv } from "@packages/t3-env/server"

export function parseTrustedOAuthClientIdSet(raw: string | undefined) {
  if (!raw) {
    return new Set<string>()
  }

  const ids = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  return new Set(ids)
}

export function parseTrustedOAuthClientIds() {
  return parseTrustedOAuthClientIdSet(serverEnv.OAUTH_TRUSTED_CLIENT_IDS)
}
