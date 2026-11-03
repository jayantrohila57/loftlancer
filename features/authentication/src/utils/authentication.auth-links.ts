import {
  authUrlDefault,
  consoleUrlDefault,
  studioUrlDefault,
  trimTrailingSlash,
} from "../config/authentication.platform-urls.config";
import { DEFAULT_SUPPORT_URL } from "../constants/authentication.platform-url.constants";
import type {
  PlatformUrlEnv,
  SignInProvider,
} from "../types/authentication.auth-links.types";

export type { PlatformUrlEnv, SignInProvider };

export function defaultSupportReturnTo(env: PlatformUrlEnv = {}): string {
  const supportOrigin = trimTrailingSlash(
    env.supportUrl ??
      process.env.NEXT_PUBLIC_SUPPORT_URL ??
      DEFAULT_SUPPORT_URL,
  );
  return supportOrigin.includes("/support/tickets")
    ? supportOrigin
    : `${supportOrigin}/support/tickets`;
}

/** Absolute studio home (org list): where every sign-in lands (#302). */
export function studioHomeUrl(env: PlatformUrlEnv = {}): string {
  return trimTrailingSlash(
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? studioUrlDefault(),
  );
}

/** Public landing (site root, docs app). Signed-out studio visits land here. */
export function landingUrl(env: PlatformUrlEnv = {}): string {
  const docs = process.env.NEXT_PUBLIC_DOCS_URL?.trim();
  if (docs && !env.studioUrl) return `${trimTrailingSlash(docs)}/`;
  return new URL("/", `${studioHomeUrl(env)}/`).toString();
}

/**
 * Auth app sign-in URL with allowlisted `return_to` (Decision 4, PLAN §5).
 * Until `apps/auth` ships, the same path works on the legacy web host.
 */
export function defaultConsoleReturnTo(env: PlatformUrlEnv = {}): string {
  const consoleOrigin = trimTrailingSlash(
    env.consoleUrl ??
      process.env.NEXT_PUBLIC_CONSOLE_URL ??
      consoleUrlDefault(),
  );
  return consoleOrigin;
}

/**
 * Start GitHub or Google sign-in directly (no sign-in screen, #302). A plain
 * link: the auth app route starts the OAuth flow and returns to /studio.
 * `returnTo` is ignored (no deep-link return by design).
 */
export function buildSignInUrl(
  options: PlatformUrlEnv & {
    returnTo?: string;
    provider?: SignInProvider;
  } = {},
): string {
  const auth = trimTrailingSlash(
    options.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
  return `${auth}/api/sign-in/${options.provider ?? "github"}`;
}

/**
 * Google sign-in is offered only when GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET exist at build time (#359); each app's next.config
 * inlines that as NEXT_PUBLIC_GOOGLE_SIGN_IN.
 */
export function isGoogleSignInEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "1";
}

export function resolveAuthAppOrigin(env: PlatformUrlEnv = {}): string {
  return trimTrailingSlash(
    env.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
}

/** Post sign-out landing: the public site root. */
export function defaultAppSignInAfterSignOut(
  _appOrigin: string,
  env: PlatformUrlEnv = {},
): string {
  return landingUrl(env);
}
