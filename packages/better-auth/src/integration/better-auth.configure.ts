import type { betterAuth } from "better-auth"
import type { OrganizationOptions } from "better-auth/plugins/organization"

export type BetterAuthDatabaseHooks = NonNullable<
  Parameters<typeof betterAuth>[0]["databaseHooks"]
>

export type BetterAuthOrganizationPluginOptions = OrganizationOptions

export type BetterAuthConfiguredPlugin = NonNullable<
  Parameters<typeof betterAuth>[0]["plugins"]
>[number]

type DeleteUserOptions = NonNullable<
  NonNullable<Parameters<typeof betterAuth>[0]["user"]>["deleteUser"]
>

let configuredDatabaseHooks: BetterAuthDatabaseHooks | undefined
let configuredDeleteUser:
  | Pick<DeleteUserOptions, "beforeDelete" | "afterDelete">
  | undefined
let configuredPlugins: BetterAuthConfiguredPlugin[] | undefined
let configuredOrganizationPluginOptions:
  | BetterAuthOrganizationPluginOptions
  | undefined

export function configureBetterAuth(options: {
  databaseHooks?: BetterAuthDatabaseHooks
  deleteUser?: Pick<DeleteUserOptions, "beforeDelete" | "afterDelete">
  plugins?: BetterAuthConfiguredPlugin[]
  organizationPlugin?: BetterAuthOrganizationPluginOptions
}) {
  configuredDatabaseHooks = options.databaseHooks
  configuredDeleteUser = options.deleteUser
  configuredPlugins = options.plugins
  configuredOrganizationPluginOptions = options.organizationPlugin
}

export function getConfiguredDatabaseHooks():
  | BetterAuthDatabaseHooks
  | undefined {
  return configuredDatabaseHooks
}

export function getConfiguredDeleteUser():
  | Pick<DeleteUserOptions, "beforeDelete" | "afterDelete">
  | undefined {
  return configuredDeleteUser
}

export function getConfiguredAuthPlugins():
  | BetterAuthConfiguredPlugin[]
  | undefined {
  return configuredPlugins
}

export function getConfiguredOrganizationPluginOptions():
  | BetterAuthOrganizationPluginOptions
  | undefined {
  return configuredOrganizationPluginOptions
}

export function clearBetterAuthInstance() {
  const globalForAuth = globalThis as unknown as {
    betterAuth?: unknown
    betterAuthConfigKey?: string
  }
  globalForAuth.betterAuth = undefined
  globalForAuth.betterAuthConfigKey = undefined
}
