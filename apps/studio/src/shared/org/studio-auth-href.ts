import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import {
  studioOrgPath,
  studioSettingsPath,
} from "@/shared/org/studio-org.paths"

const STATIC_REWRITES: Readonly<Record<string, string>> = {
  "/organizations/list": "/organizations",
  "/organizations/create": "/organizations/new",
}

function orgRewrites(slug: string): Readonly<Record<string, string>> {
  return {
    "/account/organization": studioSettingsPath(slug, "/general"),
    "/account/organization/members": studioSettingsPath(slug, "/members"),
    "/account/organization/invitations": studioSettingsPath(
      slug,
      "/invitations"
    ),
    "/account/billing": studioSettingsPath(slug, "/billing"),
    "/account/billing/billing-details": studioSettingsPath(
      slug,
      "/billing/details"
    ),
    "/account/billing/invoices": studioSettingsPath(slug, "/billing/invoices"),
    "/account/billing/payment-history": studioSettingsPath(
      slug,
      "/billing/payment-history"
    ),
    "/account/billing/payment-methods": studioSettingsPath(
      slug,
      "/billing/payment-methods"
    ),
    "/account/subscription": studioSettingsPath(slug, "/billing"),
    "/account/subscription/available-plans": studioSettingsPath(
      slug,
      "/billing/plans"
    ),
    "/account/subscription/usage-entitlements": studioSettingsPath(
      slug,
      "/billing/usage-entitlements"
    ),
    "/account/ai-usage": studioOrgPath(slug, "/usage/ai"),
    "/account/ai-usage/model-usage": studioOrgPath(
      slug,
      "/usage/ai/model-usage"
    ),
    "/account/ai-usage/usage-history": studioOrgPath(
      slug,
      "/usage/ai/usage-history"
    ),
    "/account/ai-usage/limits-alerts": studioOrgPath(
      slug,
      "/usage/ai/limits-alerts"
    ),
    "/account/storage": studioOrgPath(slug, "/usage/storage"),
    "/account/storage/files": studioOrgPath(slug, "/usage/storage/files"),
    "/account/storage/storage-activity": studioOrgPath(
      slug,
      "/usage/storage/storage-activity"
    ),
    "/account/storage/trash": studioOrgPath(slug, "/usage/storage/trash"),
    "/account/activity/resource": studioOrgPath(slug, "/activity"),
  }
}

/** Map leftover Auth hrefs to Studio routes when a current org slug is known. */
export function rewriteStudioHref(href: string, slug: string | null): string {
  const hashIndex = href.indexOf("#")
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ""
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const queryIndex = withoutHash.indexOf("?")
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : ""
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash
  const route = stripLeadingLocaleFromPathname(path)
  const mapped =
    STATIC_REWRITES[route] ?? (slug ? orgRewrites(slug)[route] : undefined)
  if (!mapped) {
    if (!slug && route.startsWith("/account/")) {
      return `/organizations${query}${hash}`
    }
    return href
  }
  return `${mapped}${query}${hash}`
}
