import { serverEnv } from "@packages/t3-env/server"

export const betterAuthEmailLocales = ["en-us", "en-in", "es-es"] as const

export type BetterAuthEmailLocale = (typeof betterAuthEmailLocales)[number]

const defaultAppLocale: BetterAuthEmailLocale = "en-us"

const supported = new Set<string>(betterAuthEmailLocales)

function localeFromPathname(
  pathname: string
): BetterAuthEmailLocale | undefined {
  const segments = pathname.split("/").filter(Boolean)
  const authBase = new URL(serverEnv.BETTER_AUTH_URL).pathname.replace(
    /\/$/,
    ""
  )
  const baseSegments = authBase ? authBase.split("/").filter(Boolean) : []
  const offset = baseSegments.every(
    (segment, index) => segments[index] === segment
  )
    ? baseSegments.length
    : 0
  const candidate = segments[offset]
  if (candidate && supported.has(candidate)) {
    return candidate as BetterAuthEmailLocale
  }
  return undefined
}

function localeFromReferer(
  request: Request | undefined
): BetterAuthEmailLocale | undefined {
  if (!request) return undefined
  const referer = request.headers.get("referer")
  if (!referer) return undefined
  try {
    return localeFromPathname(new URL(referer).pathname)
  } catch {
    return undefined
  }
}

function localeFromAcceptLanguage(
  request: Request | undefined
): BetterAuthEmailLocale | undefined {
  if (!request) return undefined
  const header = request.headers.get("accept-language")
  if (!header) return undefined
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase()
    if (!tag) continue
    if (supported.has(tag)) return tag as BetterAuthEmailLocale
    const short = tag.split("-")[0]
    if (short === "en") return "en-us"
    if (short === "es") return "es-es"
  }
  return undefined
}

export function resolveBetterAuthEmailLocale(
  request?: Request
): BetterAuthEmailLocale {
  return (
    localeFromReferer(request) ??
    localeFromAcceptLanguage(request) ??
    defaultAppLocale
  )
}

export function buildAuthAppLocalePath(
  locale: BetterAuthEmailLocale,
  path: string
): string {
  const base = serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}/${locale}${normalized}`
}
