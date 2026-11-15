import { resolveMcpResourceUrl as resolveMcpResourceUrlFromMcp } from "@packages/mcp/server"

import { mcpOAuthDefaultLocale } from "./better-auth.oauth-mcp.constants"
import { resolveAuthApiPaths } from "./better-auth.paths"

export function resolveMcpResourceUrl() {
  return resolveMcpResourceUrlFromMcp()
}

export function resolveMcpOAuthPaths() {
  const locale = mcpOAuthDefaultLocale
  const { authAppUrl } = resolveAuthApiPaths()
  const appBase = authAppUrl.pathname.replace(/\/$/, "")
  const loginPage = `${appBase}/${locale}/sign-in`
  const consentPage = `${appBase}/${locale}/consent`

  return {
    loginPage,
    consentPage,
    resource: resolveMcpResourceUrl(),
  }
}
