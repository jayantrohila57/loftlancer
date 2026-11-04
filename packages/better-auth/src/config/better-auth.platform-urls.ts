import { resolvePublicServiceUrl } from "@loftlancer/t3-env/vercel-services";

/** Default production URLs — one Vercel project per app (no path prefix). */
export const DEFAULT_AUTH_URL = "https://loftlancer.com/auth";
export const DEFAULT_STUDIO_URL = "https://loftlancer.com/studio";
export const DEFAULT_ACCOUNT_URL = DEFAULT_AUTH_URL;
export const DEFAULT_WWW_URL = "https://loftlancer.com";
export const DEFAULT_MCP_URL = "https://loftlancer.com";
export const DEFAULT_CONSOLE_URL = "https://loftlancer.com/studio";
export const DEFAULT_SUPPORT_URL =
  "https://loftlancer.com/studio/support/tickets";
export const DEFAULT_DOCS_URL = "https://loftlancer.com";

function defaultAuthUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL;
}

function defaultStudioUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("studio")
    : DEFAULT_STUDIO_URL;
}

function defaultAccountUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_ACCOUNT_URL?.trim() ||
    (process.env.VERCEL_SERVICES === "1"
      ? resolvePublicServiceUrl("auth")
      : DEFAULT_ACCOUNT_URL)
  );
}

function defaultWwwUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("www")
    : DEFAULT_WWW_URL;
}

export function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function toTrustedOrigin(url: string): string {
  try {
    return new URL(trimTrailingSlash(url)).origin;
  } catch {
    return trimTrailingSlash(url);
  }
}

/** Split comma-separated platform origins (e.g. `CORS_ORIGIN`). */
export function parsePlatformOriginList(value?: string | null): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => toTrustedOrigin(part));
}

/** Origins allowed for `return_to` and Better Auth `trustedOrigins` (production only). */
export function getPlatformProductionOrigins(
  env: {
    authUrl?: string;
    studioUrl?: string;
    accountUrl?: string;
    wwwUrl?: string;
    mcpUrl?: string;
    supportUrl?: string;
    consoleUrl?: string;
    legacyWebUrl?: string;
  } = {},
): string[] {
  const origins = [
    env.authUrl ?? process.env.BETTER_AUTH_URL ?? defaultAuthUrl(),
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? defaultStudioUrl(),
    env.accountUrl ??
      process.env.NEXT_PUBLIC_ACCOUNT_URL ??
      defaultAccountUrl(),
    env.supportUrl ??
      process.env.NEXT_PUBLIC_SUPPORT_URL ??
      DEFAULT_SUPPORT_URL,
    env.wwwUrl ?? process.env.NEXT_PUBLIC_WWW_URL ?? defaultWwwUrl(),
    process.env.NEXT_PUBLIC_DOCS_URL ?? DEFAULT_DOCS_URL,
    ...parsePlatformOriginList(env.legacyWebUrl ?? process.env.CORS_ORIGIN),
  ].filter(Boolean) as string[];

  return [...new Set(origins.map((o) => toTrustedOrigin(o)))];
}
