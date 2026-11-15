/** Split a space-separated OAuth scope string from the device verification API. */
export function parseDeviceAuthorizationScopes(
  scope: string | undefined
): readonly string[] {
  if (!scope?.trim()) return []
  return scope.split(/\s+/).filter((entry) => entry.length > 0)
}
