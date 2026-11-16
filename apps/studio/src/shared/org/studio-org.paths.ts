import { STUDIO_RESERVED_ORG_SLUGS } from "@/shared/org/studio-org.constants"

const reserved = new Set<string>(STUDIO_RESERVED_ORG_SLUGS)

export function isReservedStudioOrgSlug(slug: string): boolean {
  return reserved.has(slug.trim().toLowerCase())
}

export type StudioNavArea = "organizations" | "workspace" | "settings"

/** Pathname from next-intl (no locale prefix). */
export function readPathSegments(pathname: string): readonly string[] {
  return pathname.split("/").filter(Boolean)
}

export function readStudioNavArea(pathname: string): StudioNavArea {
  const first = readPathSegments(pathname)[0] ?? ""
  if (
    first === "organizations" ||
    first === "invite" ||
    first === "onboarding"
  ) {
    return "organizations"
  }
  if (first === "settings") return "settings"
  return "workspace"
}

/** Org slug from `/{org}/...` or `/settings/{org}/...`. */
export function readOrgSlugFromPathname(pathname: string): string | null {
  const parts = readPathSegments(pathname)
  const first = parts[0]
  if (first === "settings") {
    const slug = parts[1]
    if (!slug || isReservedStudioOrgSlug(slug)) return null
    return slug
  }
  if (!first || isReservedStudioOrgSlug(first)) return null
  return first
}

export function studioOrgPath(slug: string, suffix = ""): string {
  const path = suffix.startsWith("/") ? suffix : suffix ? `/${suffix}` : ""
  return `/${slug}${path}`
}

export function studioSettingsPath(slug: string, suffix = ""): string {
  const path = suffix.startsWith("/") ? suffix : suffix ? `/${suffix}` : ""
  return `/settings/${slug}${path}`
}

export function studioSettingsSuffixFromPathname(
  pathname: string,
  slug: string
): string {
  const prefix = `/settings/${slug}`
  const parts = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : ""
  return parts.startsWith("/") ? parts : parts ? `/${parts}` : "/general"
}

export function studioAbsolutePath(locale: string, path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}/${locale}${suffix}`
}
