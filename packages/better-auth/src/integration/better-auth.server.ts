import * as schema from "@packages/drizzle/schema"
import { serverEnv } from "@packages/t3-env/server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import {
  getConfiguredDatabaseHooks,
  getConfiguredDeleteUser,
} from "./better-auth.configure"
import { getTrustedAuthOrigins } from "./better-auth.origins"
import { resolveAuthApiPaths } from "./better-auth.paths"
import { buildAuthPlugins } from "./better-auth.plugins"
import {
  requireAuthDatabase,
  requireAuthSecret,
} from "./better-auth.requirements"
import { buildSocialProviders } from "./better-auth.social-providers"

const globalForAuth = globalThis as unknown as {
  betterAuth: ReturnType<typeof createAuth> | undefined
  betterAuthConfigKey: string | undefined
}

function getAuthConfigKey(): string {
  return `${serverEnv.BETTER_AUTH_URL}|${serverEnv.DATABASE_URL ?? ""}|${serverEnv.BETTER_AUTH_DEVICE_CLIENT_IDS ?? ""}|${serverEnv.BETTER_AUTH_DEVICE_SCOPES ?? ""}|mcp-oauth-v1|sso-v1|soft-delete-v2|device-authorization-v1|org-v1|autumn-v1`
}

export function createAuth() {
  const db = requireAuthDatabase()
  const secret = requireAuthSecret()
  const { basePath, baseURL } = resolveAuthApiPaths()

  return betterAuth({
    advanced: { disableOriginCheck: false },
    disabledPaths: ["/token"],
    databaseHooks: getConfiguredDatabaseHooks(),
    basePath,
    baseURL,
    trustedOrigins: getTrustedAuthOrigins(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    plugins: buildAuthPlugins(),
    secret,
    session: { freshAge: 86_400 },
    socialProviders: buildSocialProviders(),
    user: {
      additionalFields: {
        deletedAt: {
          type: "date",
          required: false,
          input: false,
        },
      },
      deleteUser: {
        enabled: true,
        ...getConfiguredDeleteUser(),
      },
    },
  })
}

export function getAuth() {
  const configKey = getAuthConfigKey()
  if (
    globalForAuth.betterAuth &&
    globalForAuth.betterAuthConfigKey === configKey
  ) {
    return globalForAuth.betterAuth
  }

  const auth = createAuth()
  globalForAuth.betterAuth = auth
  globalForAuth.betterAuthConfigKey = configKey
  return auth
}
