import { defaultSupportedLocales } from "../constants/i18n.constants"

export function buildPathnameWithLocationSuffix(
  pathname: string,
  search = "",
  hash = ""
): string {
  return `${pathname}${search}${hash}`
}

export function readBrowserLocationSuffix(): { hash: string; search: string } {
  if (typeof window === "undefined") {
    return { hash: "", search: "" }
  }

  return {
    hash: window.location.hash,
    search: window.location.search,
  }
}

/** Keeps the current route path while preserving query string and hash (locale switches, language save). */
export function buildPathnamePreservingBrowserQuery(pathname: string): string {
  const { hash, search } = readBrowserLocationSuffix()
  return buildPathnameWithLocationSuffix(pathname, search, hash)
}

/** Normalizes pathname for account/shell matching when a locale segment is present. */
export function stripLeadingLocaleFromPathname(
  pathname: string,
  locales: readonly string[] = defaultSupportedLocales
): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`
  const segments = normalized.split("/").filter(Boolean)
  if (segments.length === 0) {
    return "/"
  }

  const [first, ...rest] = segments
  if (first && locales.includes(first)) {
    return rest.length > 0 ? `/${rest.join("/")}` : "/"
  }

  return normalized
}
