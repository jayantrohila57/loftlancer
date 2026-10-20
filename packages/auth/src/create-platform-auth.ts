import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { mcp } from "@better-auth/mcp";
import { MCP_OAUTH_SCOPES } from "@loftlancer/actions";
import { env } from "@loftlancer/env/server";
import { resolvePlatformPublicOrigin } from "@loftlancer/env/vercel-services";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { deviceAuthorization, jwt, oneTimeToken } from "better-auth/plugins";
import {
  coreAuthPlugins,
  platformDatabaseConfig,
  sharedAuthAdvanced,
  sharedDatabaseHooks,
  sharedSessionConfig,
  withNextCookies,
} from "./auth-shared";
import {
  magicLinkPlugin,
  passwordDisabled,
  socialProviders,
} from "./passwordless";
import {
  DEFAULT_AUTH_URL,
  DEFAULT_MCP_URL,
  getPlatformProductionOrigins,
  trimTrailingSlash,
} from "./platform-urls";
import { upstashRateLimitStorage } from "./rate-limit-storage";

function buildMcpPlugins(): BetterAuthPlugin[] {
  if (process.env.PLATFORM_AUTH_ENABLE_MCP !== "1") {
    return [];
  }
  const mcpHost = trimTrailingSlash(
    process.env.MCP_RESOURCE_URL ??
      process.env.NEXT_PUBLIC_MCP_URL ??
      (process.env.VERCEL_SERVICES === "1"
        ? `${resolvePlatformPublicOrigin()}/api/mcp`
        : `${DEFAULT_MCP_URL.replace(/\/$/, "")}/api/mcp`),
  );
  const mcpResource = mcpHost.endsWith("/api/mcp")
    ? mcpHost
    : `${mcpHost}/api/mcp`;

  return [
    mcp({
      loginPage: "/",
      consentPage: "/consent",
      resource: mcpResource,
      scopes: [...MCP_OAUTH_SCOPES],
      allowDynamicClientRegistration: true,
    }) as BetterAuthPlugin,
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }) as BetterAuthPlugin,
  ];
}

/**
 * Better Auth instance for `apps/auth` only — OAuth issuer, MCP, device flow (P2).
 * Import only from the auth app route handler.
 */
export function createPlatformAuth() {
  const baseURL = trimTrailingSlash(
    env.BETTER_AUTH_URL ??
      (process.env.VERCEL_SERVICES === "1"
        ? `${resolvePlatformPublicOrigin()}/auth`
        : DEFAULT_AUTH_URL),
  );
  const trustedOrigins = getPlatformProductionOrigins({
    authUrl: baseURL,
    legacyWebUrl: env.CORS_ORIGIN,
  });

  // Single-project deploy: auth app lives under a Next basePath (e.g. `/auth`), so
  // Better Auth must run at origin + `/auth/api/auth` (not derive `/auth` from the URL path).
  const parsedBase = new URL(baseURL);
  const appPath = parsedBase.pathname.replace(/\/$/, "");
  const authOrigin = appPath ? parsedBase.origin : baseURL;
  const authBasePath = appPath ? `${appPath}/api/auth` : undefined;

  return betterAuth({
    baseURL: authOrigin,
    ...(authBasePath ? { basePath: authBasePath } : {}),
    secret:
      env.BETTER_AUTH_SECRET ?? "local-build-placeholder-secret-min-32-chars",
    advanced: sharedAuthAdvanced(),
    databaseHooks: sharedDatabaseHooks(),
    session: sharedSessionConfig(),
    ...passwordDisabled,
    database: platformDatabaseConfig(),
    rateLimit: {
      enabled: env.NODE_ENV === "production",
      window: 10,
      max: 100,
      customRules: {
        "/sign-in/magic-link": { window: 60, max: 5 },
      },
      customStorage: upstashRateLimitStorage,
    },
    trustedOrigins,
    socialProviders: socialProviders(),
    plugins: withNextCookies([
      ...coreAuthPlugins(),
      magicLinkPlugin(),
      jwt(),
      oneTimeToken({
        expiresIn: 5,
      }),
      deviceAuthorization({
        verificationUri: "/device",
      }),
      ...buildMcpPlugins(),
    ]) as BetterAuthPlugin[],
  });
}
