import { STUDIO_RESERVED_ORG_SLUGS } from "@/shared/org/studio-org.constants"

const reserved = new Set<string>(STUDIO_RESERVED_ORG_SLUGS)

export function isReservedStudioOrgSlug(slug: string): boolean {
  return reserved.has(slug.trim().toLowerCase())
}

/** Pathname from next-intl (no locale prefix). */
export function readOrgSlugFromPathname(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0]
  if (!first || isReservedStudioOrgSlug(first)) return null
  return first
}

export function studioOrgPath(slug: string, suffix = ""): string {
  const path = suffix.startsWith("/") ? suffix : suffix ? `/${suffix}` : ""
  return `/${slug}${path}`
}

export function studioAbsolutePath(locale: string, path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}/${locale}${suffix}`
}
