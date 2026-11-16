import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { STUDIO_RESERVED_ORG_SLUGS } from "@/shared/org/studio-org.constants"

const LOCALES = ["en-us", "en-in", "es-es"] as const
const reservedOrgSlugs = new Set<string>(STUDIO_RESERVED_ORG_SLUGS)

function basePathPrefix(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
}

function withBasePath(path: string): string {
  const base = basePathPrefix()
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}${suffix}`
}

function stripBasePath(pathname: string): string {
  const base = basePathPrefix()
  if (base && pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length)
  }
  if (base && pathname === base) return "/"
  return pathname
}

function readLocaleSegment(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0]
  return first && (LOCALES as readonly string[]).includes(first) ? first : null
}

/** 308 legacy workspace/settings URL shapes to canonical `settings/[org]/**`. */
export function studioLegacyRedirectResponse(
  request: NextRequest
): NextResponse | null {
  const pathname = stripBasePath(request.nextUrl.pathname)
  const lang = readLocaleSegment(pathname)
  if (!lang) return null

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return null

  if (segments[1] === "organizations" && segments[2] === "create") {
    const url = request.nextUrl.clone()
    url.pathname = withBasePath(`/${lang}/organizations/new`)
    return NextResponse.redirect(url, 308)
  }

  if (segments[1] === "organizations" && segments[2] === "list") {
    const url = request.nextUrl.clone()
    url.pathname = withBasePath(`/${lang}/organizations`)
    return NextResponse.redirect(url, 308)
  }

  const org = segments[1]
  if (!org || reservedOrgSlugs.has(org)) return null

  if (segments[2] === "billing") {
    const rest = segments.slice(3).join("/")
    const suffix = rest ? `/billing/${rest}` : "/billing"
    const url = request.nextUrl.clone()
    url.pathname = withBasePath(`/${lang}/settings/${org}${suffix}`)
    return NextResponse.redirect(url, 308)
  }

  if (segments[2] === "settings") {
    const rest = segments.slice(3).join("/")
    const mappedRest =
      rest === ""
        ? "general"
        : rest === "members/invitations"
          ? "invitations"
          : rest
    const url = request.nextUrl.clone()
    url.pathname = withBasePath(`/${lang}/settings/${org}/${mappedRest}`)
    return NextResponse.redirect(url, 308)
  }

  return null
}
