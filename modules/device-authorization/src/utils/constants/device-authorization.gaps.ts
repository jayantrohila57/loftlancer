/**
 * Slice 6 open decisions (requirements still awaiting product sign-off).
 *
 * - Approved client IDs: configure `BETTER_AUTH_DEVICE_CLIENT_IDS` (comma-separated).
 *   Until set, `/device/code` rejects every client (`invalid_client`).
 * - Scopes: when `BETTER_AUTH_DEVICE_SCOPES` is set, disallowed scopes are rejected on
 *   `/device/code` via `onDeviceAuthRequest`; omit the env var to skip scope allowlisting.
 * - Verification URL: defaults to `{BETTER_AUTH_URL}/device`; override with
 *   `BETTER_AUTH_DEVICE_VERIFICATION_URL` when the canonical entry point is decided.
 * - CLI-only vs additional clients: no first-party client registry beyond env allowlist.
 * - Activity auditing for approve/deny: recorded via `buildDeviceAuthorizationActivityPlugin`.
 */
export const DEVICE_AUTHORIZATION_SLICE_GAPS = {
  scopeEnforcement: "implemented",
  serverActivityRecording: "implemented",
  browserVerification: "code-tested",
} as const
