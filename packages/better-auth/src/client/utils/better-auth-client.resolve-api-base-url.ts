import { BETTER_AUTH_CLIENT_API_PATH } from "../constants/better-auth-client.api-path.constants";

/**
 * Better Auth treats any path in `baseURL` as the full API path, so normalize
 * origin-only inputs to `<origin>/api/better-auth`.
 */
export function resolveBetterAuthClientApiBaseURL(
  baseURL: string | undefined,
): string | undefined {
  if (!baseURL) {
    return undefined;
  }
  const trimmed = baseURL.replace(/\/$/, "");
  return trimmed.endsWith(BETTER_AUTH_CLIENT_API_PATH)
    ? trimmed
    : `${trimmed}${BETTER_AUTH_CLIENT_API_PATH}`;
}
