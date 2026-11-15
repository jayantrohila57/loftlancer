import { clientEnv } from "@packages/t3-env/client"

const authLocales = ["en-us", "en-in", "es-es"] as const
const localePattern = authLocales.join("|")

const authPublicPathPattern = new RegExp(
  `^/(?:${localePattern})(?:/(?:sign-in(?:/sso)?|check-email|error|unauthorized|continue|welcome|first-login|consent|device)(?:/|$)|/?$)`
)

function stripAuthAppBasePath(pathname: string): string {
  try {
    const basePath = new URL(
      clientEnv.NEXT_PUBLIC_AUTH_APP_URL
    ).pathname.replace(/\/$/, "")
    if (basePath && pathname === basePath) {
      return "/"
    }
    if (basePath && pathname.startsWith(`${basePath}/`)) {
      return pathname.slice(basePath.length)
    }
  } catch {
    // Fall through with the original pathname when env is not a valid URL.
  }
  return pathname
}

/** Paths where a missing session is expected and must not trigger a client redirect. */
export function isAuthPublicPathname(pathname: string): boolean {
  return authPublicPathPattern.test(stripAuthAppBasePath(pathname))
}

export function buildAuthSignInLocation(input: {
  locale: string
  returnTo?: string
}): string {
  const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const url = new URL(`${base}/${input.locale}/sign-in`)
  const returnTo =
    input.returnTo ??
    (typeof window !== "undefined" ? window.location.href : undefined)
  if (returnTo) {
    url.searchParams.set("returnTo", returnTo)
  }
  return url.toString()
}
