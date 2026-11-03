import { env } from "@loftlancer/t3-env/server";
import { betterAuth } from "better-auth";
import { oneTimeToken } from "better-auth/plugins";
import {
  DEFAULT_AUTH_URL,
  getPlatformProductionOrigins,
} from "../config/better-auth.platform-urls";
import {
  e2eMagicLinkPlugins,
  passwordDisabled,
} from "./better-auth.passwordless";
import { upstashRateLimitStorage } from "./better-auth.rate-limit-storage";
import {
  coreAuthPlugins,
  sharedAuthAdvanced,
  sharedDatabaseConfig,
  sharedDatabaseHooks,
  sharedSessionConfig,
  withNextCookies,
} from "./better-auth.shared";

export type CreateSiblingAuthOptions = {
  /** Public origin of this app (`BETTER_AUTH_URL` for studio/account). */
  baseURL: string;
};

/**
 * Session + org plugin instance for studio/account — no social login (auth app only).
 * Mount at `/api/better-auth/*` on sibling apps for per-origin cookies + OTT verify.
 */
export function createSiblingAuth(options: CreateSiblingAuthOptions) {
  const trustedOrigins = getPlatformProductionOrigins({
    legacyWebUrl: env.CORS_ORIGIN,
  });

  // App under a Next basePath (e.g. `/studio`): serve Better Auth at
  // origin + `<basePath>/api/better-auth` instead of deriving the path from baseURL.
  const rawBase = (
    options.baseURL ||
    env.BETTER_AUTH_URL ||
    DEFAULT_AUTH_URL
  ).replace(/\/$/, "");
  const parsedBase = new URL(rawBase);
  const appPath = parsedBase.pathname.replace(/\/$/, "");

  return betterAuth({
    baseURL: appPath ? parsedBase.origin : rawBase,
    ...(appPath ? { basePath: `${appPath}/api/better-auth` } : {}),
    secret:
      env.BETTER_AUTH_SECRET ?? "local-build-placeholder-secret-min-32-chars",
    advanced: sharedAuthAdvanced(),
    databaseHooks: sharedDatabaseHooks(),
    session: sharedSessionConfig(),
    ...passwordDisabled,
    database: sharedDatabaseConfig(),
    rateLimit: {
      enabled: env.NODE_ENV === "production",
      window: 10,
      max: 100,
      customStorage: upstashRateLimitStorage,
    },
    trustedOrigins,
    plugins: withNextCookies([
      ...coreAuthPlugins(),
      ...e2eMagicLinkPlugins(),
      oneTimeToken({
        expiresIn: 5,
      }),
    ]),
  });
}
