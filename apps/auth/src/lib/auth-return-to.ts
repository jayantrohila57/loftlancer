import {
  DEFAULT_AUTH_URL,
  trimTrailingSlash,
} from "@loftlancer/better-auth/platform-urls";
import { validateReturnTo } from "@loftlancer/better-auth/return-to";

/** Absolute HTTPS return URL for post–sign-in flows on the auth app (device, consent). */
export function authAppReturnTo(pathWithQuery: string): string {
  const path = pathWithQuery.startsWith("/")
    ? pathWithQuery
    : `/${pathWithQuery}`;
  const origin = trimTrailingSlash(
    process.env.NEXT_PUBLIC_AUTH_URL ??
      process.env.BETTER_AUTH_URL ??
      DEFAULT_AUTH_URL,
  );
  return validateReturnTo(`${origin}${path}`, {
    fallback: `${origin}/settings`,
  });
}
