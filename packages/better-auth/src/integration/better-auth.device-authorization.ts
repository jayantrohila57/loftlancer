import { serverEnv } from "@packages/t3-env/server"
import { APIError } from "better-auth/api"
import { deviceAuthorization } from "better-auth/plugins/device-authorization"

import { resolveAuthAppUrl } from "./better-auth.paths"

/** Approved OAuth device-flow client IDs from comma-separated server env. */
export function parseApprovedDeviceClientIds(
  raw = serverEnv.BETTER_AUTH_DEVICE_CLIENT_IDS
): ReadonlySet<string> {
  if (!raw?.trim()) return new Set()
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  )
}

/** Space-separated scopes allowlisted for device authorization requests. */
export function parseApprovedDeviceScopes(
  raw = serverEnv.BETTER_AUTH_DEVICE_SCOPES
): ReadonlySet<string> {
  if (!raw?.trim()) return new Set()
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  )
}

export function isApprovedDeviceClient(
  clientId: string,
  clientIdsRaw?: string
): boolean {
  const approved = parseApprovedDeviceClientIds(clientIdsRaw)
  if (approved.size === 0) return false
  return approved.has(clientId)
}

export function isApprovedDeviceScope(
  scope: string | undefined,
  scopesRaw?: string
): boolean {
  if (!scope?.trim()) return true
  const approved = parseApprovedDeviceScopes(scopesRaw)
  if (approved.size === 0) return false
  return scope
    .split(/\s+/)
    .filter(Boolean)
    .every((entry) => approved.has(entry))
}

export function resolveDeviceVerificationUri(): string {
  const override = serverEnv.BETTER_AUTH_DEVICE_VERIFICATION_URL
  if (override) return override
  const appUrl = resolveAuthAppUrl()
  return new URL("./device", appUrl).toString()
}

/** Reject disallowed scopes when `BETTER_AUTH_DEVICE_SCOPES` is configured. */
export function assertApprovedDeviceScopes(
  scope: string | undefined,
  scopesRaw = serverEnv.BETTER_AUTH_DEVICE_SCOPES
): void {
  const approved = parseApprovedDeviceScopes(scopesRaw)
  if (approved.size === 0) return
  if (isApprovedDeviceScope(scope, scopesRaw)) return
  throw new APIError("BAD_REQUEST", {
    error: "invalid_scope",
    error_description: "One or more requested scopes are not allowed",
  })
}

export function buildDeviceAuthorizationPlugin() {
  return deviceAuthorization({
    verificationUri: resolveDeviceVerificationUri(),
    validateClient: (clientId) => isApprovedDeviceClient(clientId),
    onDeviceAuthRequest: (_clientId, scope) => {
      assertApprovedDeviceScopes(scope)
    },
  })
}
