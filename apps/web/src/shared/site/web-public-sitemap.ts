import { defaultSupportedLocales } from "@features/i18n/constants"
import { brandLinks } from "@packages/brand"
import { WEB_HELP_ARTICLE_SLUGS } from "@/shared/help/web-help-articles"
import { webSiteNavItemSpecs } from "@/shared/shell/web-site-navigation"

const EXTRA_PUBLIC_PATHS = [
  "/whats-new",
  "/status",
  "/status/history",
  "/pricing",
  "/legal/security",
  "/legal/subprocessors",
] as const

export function getWebPublicPaths(): readonly string[] {
  const navPaths = webSiteNavItemSpecs.map((item) => item.href)
  const helpPaths = WEB_HELP_ARTICLE_SLUGS.map((slug) => `/help/${slug}`)
  return [...new Set([...navPaths, ...EXTRA_PUBLIC_PATHS, ...helpPaths])]
}

export function getWebAbsoluteLocalizedUrls(): string[] {
  const base = brandLinks.website.replace(/\/$/, "")
  const paths = getWebPublicPaths()
  return defaultSupportedLocales.flatMap((locale) =>
    paths.map((path) => `${base}/${locale}${path === "/" ? "" : path}`)
  )
}
