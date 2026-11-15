import { serverEnv } from "@packages/t3-env/server"

export function resolveAuthAppUrl() {
  return new URL(serverEnv.BETTER_AUTH_URL)
}

/** API base path for Better Auth (`{appBase}/api/auth` or `/api/auth`). */
export function resolveAuthApiPaths() {
  const authAppUrl = resolveAuthAppUrl()
  const appBasePath = authAppUrl.pathname.replace(/\/$/, "")
  const basePath = appBasePath ? `${appBasePath}/api/auth` : "/api/auth"
  return { authAppUrl, basePath, baseURL: authAppUrl.origin }
}
