import { env } from "@loftlancer/t3-env/server";
import { betterAuth } from "better-auth";
import {
  e2eMagicLinkPlugins,
  passwordDisabled,
  socialProviders,
} from "./better-auth.passwordless";
import {
  coreAuthPlugins,
  sharedAuthAdvanced,
  sharedDatabaseConfig,
  sharedDatabaseHooks,
  sharedSessionConfig,
  withNextCookies,
} from "./better-auth.shared";

/** Legacy `apps/web` auth — unchanged behavior until P3 cutover (#97). */
export const auth = betterAuth({
  advanced: sharedAuthAdvanced(),
  databaseHooks: sharedDatabaseHooks(),
  session: sharedSessionConfig(),
  ...passwordDisabled,
  database: sharedDatabaseConfig(),
  trustedOrigins: [env.CORS_ORIGIN],
  socialProviders: socialProviders(),
  plugins: withNextCookies([...coreAuthPlugins(), ...e2eMagicLinkPlugins()]),
});
