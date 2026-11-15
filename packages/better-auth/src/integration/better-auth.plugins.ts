import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins/admin"
import { magicLink } from "better-auth/plugins/magic-link"

import { betterAuthAdminRoles } from "./better-auth.admin-roles"
import { getConfiguredAuthPlugins } from "./better-auth.configure"
import { buildDeviceAuthorizationPlugin } from "./better-auth.device-authorization"
import { sendMagicLinkEmail } from "./better-auth.email"
import { buildPublicListAccountsPlugin } from "./better-auth.list-accounts-public"
import { buildJwtPlugin, buildMcpOAuthPlugin } from "./better-auth.oauth-mcp"
import {
  buildAutumnPlugin,
  buildOrganizationPlugin,
} from "./better-auth.org-billing"
import { buildSoftDeleteUserPlugin } from "./better-auth.soft-delete"
import { buildSsoPlugin } from "./better-auth.sso"

export function buildAuthPlugins() {
  return [
    buildJwtPlugin(),
    buildMcpOAuthPlugin(),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      roles: betterAuthAdminRoles,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url })
      },
    }),
    buildSsoPlugin(),
    buildDeviceAuthorizationPlugin(),
    buildPublicListAccountsPlugin(),
    buildSoftDeleteUserPlugin(),
    buildOrganizationPlugin(),
    buildAutumnPlugin(),
    ...(getConfiguredAuthPlugins() ?? []),
    nextCookies(),
  ]
}
