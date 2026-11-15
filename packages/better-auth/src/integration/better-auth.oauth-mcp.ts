import { mcp } from "@better-auth/mcp"
import { jwt } from "better-auth/plugins"

import {
  mcpAccessTokenTtlSeconds,
  mcpOAuthDefaultLocale,
  mcpOAuthScopes,
  mcpProtectedResourceScopes,
} from "./better-auth.oauth-mcp.constants"
import {
  resolveMcpOAuthPaths,
  resolveMcpResourceUrl,
} from "./better-auth.oauth-mcp.paths"
import { parseTrustedOAuthClientIds } from "./better-auth.oauth-mcp.trusted-clients"

export { resolveMcpResourceUrl }

export function buildJwtPlugin() {
  return jwt({ disableSettingJwtHeader: true })
}

export function buildMcpOAuthPlugin() {
  const { consentPage, loginPage, resource } = resolveMcpOAuthPaths()
  const cachedTrustedClients = parseTrustedOAuthClientIds()

  return mcp({
    loginPage,
    consentPage,
    resource,
    scopes: [...mcpOAuthScopes],
    allowDynamicClientRegistration: false,
    allowUnauthenticatedClientRegistration: false,
    cachedTrustedClients:
      cachedTrustedClients.size > 0 ? cachedTrustedClients : undefined,
    resources: [
      {
        identifier: resource,
        allowedScopes: [...mcpOAuthScopes],
        accessTokenTtl: mcpAccessTokenTtlSeconds,
      },
    ],
    refreshTokenReuseInterval: 30,
  })
}

export { mcpProtectedResourceScopes }

export function resolveMcpConsentLoginLocale() {
  return mcpOAuthDefaultLocale
}
