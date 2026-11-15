import "server-only"

import { buildAdminAuthDatabaseHooks } from "@modules/admin/server"
import { buildNotificationAuthDatabaseHooks } from "@modules/notifications/server"
import { buildOrgOrganizationPluginOptions } from "@modules/org/server"
import { buildProfileAuthDatabaseHooks } from "@modules/profile/server"
import {
  buildDeviceAuthorizationActivityPlugin,
  buildSecurityAuthDatabaseHooks,
  buildSecurityDeleteUserCallbacks,
} from "@modules/security/server"
import { configureBetterAuth } from "@packages/better-auth"

import { mergeDatabaseHooks } from "./merge-database-hooks"

configureBetterAuth({
  databaseHooks: mergeDatabaseHooks(
    buildSecurityAuthDatabaseHooks(),
    buildNotificationAuthDatabaseHooks(),
    buildAdminAuthDatabaseHooks(),
    buildProfileAuthDatabaseHooks()
  ),
  deleteUser: buildSecurityDeleteUserCallbacks(),
  organizationPlugin: buildOrgOrganizationPluginOptions(),
  plugins: [buildDeviceAuthorizationActivityPlugin()],
})
