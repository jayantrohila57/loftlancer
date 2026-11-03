import {
  getSessionCookie,
  parseCookies,
  stripSecureCookiePrefix,
} from "better-auth/cookies";

/** Current Better Auth cookie prefix (session cookies). */
export const LOFTLANCER_COOKIE_PREFIX = "loftlancer";

/** @deprecated Renamed to {@link LOFTLANCER_COOKIE_PREFIX}. */
export const COLLIDR_COOKIE_PREFIX = LOFTLANCER_COOKIE_PREFIX;

/**
 * Legacy prefixes still accepted on read until clients receive `loftlancer.*` cookies.
 * Includes the prior `collidr` product prefix, Better Auth default, and `env-manager`.
 */
export const LEGACY_SESSION_COOKIE_PREFIXES = [
  "collidr",
  "better-auth",
  "env-manager",
] as const;

export type LegacySessionCookiePrefix =
  (typeof LEGACY_SESSION_COOKIE_PREFIXES)[number];

export type LegacySessionCookieHit = {
  prefix: LegacySessionCookiePrefix;
  /** Raw cookie value as sent by the browser (signed token). */
  rawValue: string;
  /** Cookie name without `__Secure-` / `__Host-`. */
  cookieName: string;
};

const SESSION_COOKIE_BASE = "session_token";

function sessionCookieBaseNames(prefix: string): string[] {
  return [
    `${prefix}.${SESSION_COOKIE_BASE}`,
    `${prefix}-${SESSION_COOKIE_BASE}`,
  ];
}

function readRawSessionCookie(
  cookieHeader: string | null | undefined,
  prefix: string,
): { rawValue: string; cookieName: string } | null {
  if (!cookieHeader) {
    return null;
  }
  const parsed = parseCookies(cookieHeader);
  for (const baseName of sessionCookieBaseNames(prefix)) {
    for (const name of [
      baseName,
      `__Secure-${baseName}`,
      `__Host-${baseName}`,
    ]) {
      const value = parsed.get(name);
      if (value) {
        return { rawValue: value, cookieName: name };
      }
    }
  }
  return null;
}

/** Session token for the current `loftlancer` prefix, if present. */
export function getLoftlancerSessionToken(
  headers: Headers | Request,
): string | null {
  return getSessionCookie(headers, {
    cookiePrefix: LOFTLANCER_COOKIE_PREFIX,
  });
}

/** @deprecated Use {@link getLoftlancerSessionToken}. */
export const getCollidrSessionToken = getLoftlancerSessionToken;

/** First legacy session cookie on the request (raw signed value). */
export function findLegacySessionCookie(
  headers: Headers | Request,
): LegacySessionCookieHit | null {
  const cookieHeader =
    headers instanceof Headers
      ? headers.get("cookie")
      : headers.headers.get("cookie");
  if (getLoftlancerSessionToken(headers)) {
    return null;
  }
  for (const prefix of LEGACY_SESSION_COOKIE_PREFIXES) {
    const hit = readRawSessionCookie(cookieHeader, prefix);
    if (hit) {
      return { prefix, ...hit };
    }
  }
  return null;
}

/** True when any supported session cookie prefix is present. */
export function hasSessionCookieFromAnyPrefix(
  headers: Headers | Request,
): boolean {
  return Boolean(
    getLoftlancerSessionToken(headers) || findLegacySessionCookie(headers),
  );
}

/** Cookie names to expire when migrating off a legacy prefix. */
export function legacySessionCookieNamesToExpire(
  prefix: LegacySessionCookiePrefix,
): string[] {
  const names = new Set<string>();
  for (const base of sessionCookieBaseNames(prefix)) {
    names.add(base);
    names.add(`__Secure-${base}`);
    names.add(`__Host-${base}`);
  }
  return [...names];
}

export function isLegacySessionCookieName(cookieName: string): boolean {
  const bare = stripSecureCookiePrefix(cookieName);
  for (const prefix of LEGACY_SESSION_COOKIE_PREFIXES) {
    if (
      bare === `${prefix}.${SESSION_COOKIE_BASE}` ||
      bare === `${prefix}-${SESSION_COOKIE_BASE}`
    ) {
      return true;
    }
  }
  return false;
}
