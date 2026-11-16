import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

/** Mirrors `redirects()` in `apps/auth/next.config.ts` (locale-free path suffixes). */
export const AUTH_ACCOUNT_LEGACY_REDIRECTS = [
  ["/account/security/user-activity", "/account/activity/account"],
  [
    "/account/security/user-activity/data-management",
    "/account/activity/data-management",
  ],
  ["/account/security/activity", "/account/activity/security"],
  ["/account/permissions", "/account/security/permissions"],
] as const

/** Migrated to Studio — Auth keeps permanent redirects only. */
export const AUTH_STUDIO_MIGRATED_PATH_PREFIXES = [
  "/account/organization",
  "/account/billing",
  "/account/subscription",
  "/account/ai-usage",
  "/account/storage",
  "/organizations",
] as const

/** Locale-free auth entry and post-auth routes (excluding `/account`). */
export const AUTH_FLOW_LOCALE_FREE_PATHS = [
  "/",
  "/sign-in",
  "/sign-in/sso",
  "/check-email",
  "/error",
  "/unauthorized",
  "/continue",
  "/welcome",
  "/first-login",
  "/consent",
  "/device",
] as const

const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist", ".next"])

function walkAppPages(
  appDir: string,
  routePrefix: string,
  hrefs: Set<string>
): void {
  function walk(currentDir: string, segments: string[]) {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry)
      if (statSync(fullPath).isDirectory()) {
        const nextSegments =
          entry.startsWith("(") && entry.endsWith(")")
            ? segments
            : [...segments, entry]
        walk(fullPath, nextSegments)
        continue
      }

      if (entry !== "page.tsx") {
        continue
      }

      if (segments.length === 0) {
        hrefs.add(routePrefix === "" ? "/" : routePrefix)
      } else {
        hrefs.add(`${routePrefix}/${segments.join("/")}`)
      }
    }
  }

  walk(appDir, [])
}

/** Collects locale-free app paths that have a `page.tsx` under `apps/auth/src/app/[lang]`. */
export function collectAuthAppLocaleFreePagePaths(
  repoRoot: string
): Set<string> {
  const hrefs = new Set<string>()
  const appLangRoot = join(repoRoot, "apps/auth/src/app/[lang]")

  walkAppPages(join(appLangRoot, "(account)/account"), "/account", hrefs)
  walkAppPages(join(appLangRoot, "(auth)"), "", hrefs)

  return hrefs
}

function isStudioMigratedAuthHref(href: string): boolean {
  return AUTH_STUDIO_MIGRATED_PATH_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`)
  )
}

export function authAppPathHasPage(
  href: string,
  pagePaths: Set<string>
): boolean {
  if (isStudioMigratedAuthHref(href)) {
    return true
  }

  if (pagePaths.has(href)) {
    return true
  }

  const redirect = AUTH_ACCOUNT_LEGACY_REDIRECTS.find(
    ([legacy]) => legacy === href
  )
  if (redirect) {
    return pagePaths.has(redirect[0]) && pagePaths.has(redirect[1])
  }

  return false
}

const HREF_LITERAL_PATTERN = /href:\s*"(\/(?:account|organizations)[^"]*)"/g
const LINK_HREF_PATTERN =
  /<Link[^>]*\shref="(\/(?:account|organizations)[^"]*)"/g

/** Static locale-free account/org href literals from source (configs and JSX). */
export function collectStaticAuthAppHrefLiterals(
  repoRoot: string,
  roots: readonly string[]
): Set<string> {
  const hrefs = new Set<string>()

  function walkSourceDir(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (SKIP_DIR_NAMES.has(entry.name)) {
        continue
      }
      const fullPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walkSourceDir(fullPath)
        continue
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) {
        continue
      }

      const source = readFileSync(fullPath, "utf8")
      for (const pattern of [HREF_LITERAL_PATTERN, LINK_HREF_PATTERN]) {
        pattern.lastIndex = 0
        let match = pattern.exec(source)
        while (match !== null) {
          if (match[1]) hrefs.add(match[1])
          match = pattern.exec(source)
        }
      }
    }
  }

  for (const root of roots) {
    walkSourceDir(join(repoRoot, root))
  }

  return hrefs
}
