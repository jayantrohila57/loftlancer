/** Reuse MCP consent scope copy for common OIDC scopes on device flows. */
export const deviceAuthorizationScopeLabelKeys = {
  email: "mcpScopeEmail",
  offline_access: "mcpScopeOfflineAccess",
  openid: "mcpScopeOpenId",
  profile: "mcpScopeProfile",
} as const

export type DeviceAuthorizationKnownScope =
  keyof typeof deviceAuthorizationScopeLabelKeys

export function deviceAuthorizationScopeLabelKey(
  scope: string
):
  | (typeof deviceAuthorizationScopeLabelKeys)[DeviceAuthorizationKnownScope]
  | "mcpScopeGeneric" {
  return scope in deviceAuthorizationScopeLabelKeys
    ? deviceAuthorizationScopeLabelKeys[scope as DeviceAuthorizationKnownScope]
    : "mcpScopeGeneric"
}
