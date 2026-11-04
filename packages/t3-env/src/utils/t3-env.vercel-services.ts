import {
  DEFAULT_ACCOUNT_URL,
  DEFAULT_AUTH_URL,
  DEFAULT_CONSOLE_URL,
  DEFAULT_DOCS_URL,
  DEFAULT_MCP_URL,
  DEFAULT_STUDIO_URL,
  DEFAULT_SUPPORT_URL,
} from "../constants/t3-env.platform-urls.constants";
import { SERVICE_BASE_PATHS } from "../constants/t3-env.service-base-paths.constants";
import type { VercelServiceName } from "../types/t3-env.vercel-services.types";

export { SERVICE_BASE_PATHS } from "../constants/t3-env.service-base-paths.constants";
export type { VercelServiceName } from "../types/t3-env.vercel-services.types";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Normalize the retired Auth app prefix in configured public URLs. */
function normalizeAuthPublicUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.replace(/\/+$/, "") === "/better-auth") {
    parsed.pathname = "/auth";
  }
  return trimTrailingSlash(parsed.toString());
}

/** Canonical public URL per app when deployed as separate Vercel projects (no path prefix). */
const STANDALONE_SERVICE_URL: Partial<Record<VercelServiceName, string>> = {
  www: DEFAULT_DOCS_URL,
  web: DEFAULT_STUDIO_URL,
  docs: DEFAULT_DOCS_URL,
  auth: DEFAULT_AUTH_URL,
  account: DEFAULT_ACCOUNT_URL,
  console: DEFAULT_CONSOLE_URL,
  support: DEFAULT_SUPPORT_URL,
  studio: DEFAULT_STUDIO_URL,
  mcp: DEFAULT_MCP_URL,
};

const SERVICE_ENV_SUFFIX: Record<VercelServiceName, string> = {
  www: "WWW",
  web: "WEB",
  docs: "DOCS",
  auth: "AUTH",
  account: "ACCOUNT",
  console: "CONSOLE",
  support: "SUPPORT",
  studio: "STUDIO",
  mcp: "MCP",
};

/** Next.js `basePath` for a service (empty in local multi-port dev). */
export function readServiceBasePath(service: VercelServiceName): string {
  const suffix = SERVICE_ENV_SUFFIX[service];
  const override =
    process.env[`NEXT_BASE_PATH_${suffix}`] ?? process.env.NEXT_BASE_PATH;
  if (override !== undefined && override !== "") {
    return normalizeBasePath(override);
  }
  if (process.env.VERCEL_SERVICES === "1") {
    return SERVICE_BASE_PATHS[service];
  }
  return "";
}

function normalizeBasePath(path: string): string {
  if (!path || path === "/") {
    return "";
  }
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.replace(/\/$/, "");
}

/** Public deployment origin (no trailing slash). */
export function resolvePlatformPublicOrigin(): string {
  const explicit =
    process.env.PLATFORM_PUBLIC_ORIGIN ??
    process.env.NEXT_PUBLIC_PLATFORM_ORIGIN;
  if (explicit?.trim()) {
    return trimTrailingSlash(explicit.trim());
  }
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production?.trim()) {
    const host = production.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  const preview = process.env.VERCEL_URL;
  if (preview?.trim()) {
    const host = preview.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "https://loftlancer.com";
}

/** Browser-facing URL for a service (includes base path, no trailing slash). */
export function resolvePublicServiceUrl(service: VercelServiceName): string {
  const envKey = `NEXT_PUBLIC_${SERVICE_ENV_SUFFIX[service]}_URL`;
  const fromEnv = process.env[envKey];
  if (fromEnv?.trim()) {
    return trimTrailingSlash(fromEnv.trim());
  }
  const base = readServiceBasePath(service);
  if (base) {
    const origin = resolvePlatformPublicOrigin();
    return `${origin}${base}`;
  }
  const standalone = STANDALONE_SERVICE_URL[service];
  if (standalone) {
    return trimTrailingSlash(standalone);
  }
  return resolvePlatformPublicOrigin();
}

/** Browser- and server-safe public auth origin (never the docs/marketing platform origin). */
export function resolveAuthPublicUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
  if (fromPublic) {
    return normalizeAuthPublicUrl(fromPublic);
  }
  const betterAuth = process.env.BETTER_AUTH_URL?.trim();
  if (betterAuth) {
    return normalizeAuthPublicUrl(betterAuth);
  }
  return normalizeAuthPublicUrl(DEFAULT_AUTH_URL);
}

/**
 * Server-side URL for the auth service (service binding at runtime on Vercel).
 * Falls back to public auth URL when bindings are unavailable (local dev, build).
 */
/** Public auth origin for server-side fetches (cross-app, MCP well-known proxy). */
export function resolveAuthServiceUrl(): string {
  const betterAuth = process.env.BETTER_AUTH_URL?.trim();
  if (betterAuth) {
    return normalizeAuthPublicUrl(betterAuth);
  }
  return resolveAuthPublicUrl();
}

/** Join a path onto a service public URL. */
export function publicServicePath(
  service: VercelServiceName,
  pathname: string,
): string {
  const base =
    service === "auth"
      ? resolveAuthPublicUrl()
      : resolvePublicServiceUrl(service);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
