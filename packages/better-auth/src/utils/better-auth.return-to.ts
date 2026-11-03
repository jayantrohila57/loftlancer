import {
  DEFAULT_STUDIO_URL,
  getPlatformProductionOrigins,
  trimTrailingSlash,
} from "../config/better-auth.platform-urls";

const DISALLOWED_URL_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
] as const;

function hasDisallowedUrlScheme(raw: string): boolean {
  const lower = raw.trim().toLowerCase();
  if (DISALLOWED_URL_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
    return true;
  }
  try {
    const protocol = new URL(raw.trim()).protocol.toLowerCase();
    return (DISALLOWED_URL_SCHEMES as readonly string[]).includes(protocol);
  } catch {
    return false;
  }
}

function isAllowedReturnOrigin(
  origin: string,
  allowedOrigins: readonly string[],
): boolean {
  const normalized = trimTrailingSlash(origin);
  return allowedOrigins.some(
    (allowed) => trimTrailingSlash(allowed) === normalized,
  );
}

/**
 * Validate absolute HTTPS `return_to` against the production allowlist (Decision 12).
 * Rejects missing scheme, dangerous URL schemes (javascript:, data:, vbscript:, file:), and non-allowlisted hosts.
 */
export function validateReturnTo(
  raw: string | null | undefined,
  options: {
    allowedOrigins?: readonly string[];
    fallback?: string;
  } = {},
): string {
  const allowed = options.allowedOrigins ?? getPlatformProductionOrigins();
  const fallback =
    options.fallback ??
    trimTrailingSlash(process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL);

  if (!raw || typeof raw !== "string") {
    return fallback;
  }

  const trimmed = raw.trim();
  if (hasDisallowedUrlScheme(trimmed)) {
    return fallback;
  }

  const isHttps = trimmed.startsWith("https://");
  const isLocalHttp =
    trimmed.startsWith("http://localhost") ||
    trimmed.startsWith("http://127.0.0.1");
  if (!isHttps && !isLocalHttp) {
    return fallback;
  }

  try {
    const url = new URL(trimmed);
    if (!isAllowedReturnOrigin(url.origin, allowed)) {
      return fallback;
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

/** Map legacy relative `redirect` query params to absolute studio `return_to`. */
export function absoluteReturnToFromRelativePath(
  path: string | null | undefined,
  studioOrigin: string,
): string | null {
  if (!path?.startsWith("/") || path.startsWith("//")) {
    return null;
  }
  return `${trimTrailingSlash(studioOrigin)}${path}`;
}
