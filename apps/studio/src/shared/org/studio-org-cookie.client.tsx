"use client"

import { useEffect } from "react"
import { STUDIO_LAST_ORG_COOKIE } from "@/shared/org/studio-org.constants"

export function StudioRememberOrgCookie({ slug }: { readonly slug: string }) {
  useEffect(() => {
    if (!slug) return
    const maxAge = 60 * 60 * 24 * 365
    // Preference slug only; Cookie Store API is not available in all browsers.
    // biome-ignore lint/suspicious/noDocumentCookie: last-used org slug is not a secret
    document.cookie = `${STUDIO_LAST_ORG_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${maxAge}; samesite=lax`
  }, [slug])
  return null
}
