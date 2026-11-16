import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import type { ShellSectionTabItem } from "@features/shell"

const ONBOARDING_CREATE_PATHS = new Set([
  "/onboarding",
  "/onboarding/organization",
  "/onboarding/plan",
  "/onboarding/invite",
])

export function resolveStudioOnboardingSectionTabValue(
  pathname: string,
  tabs: readonly ShellSectionTabItem[]
): string {
  const routePath = stripLeadingLocaleFromPathname(pathname)

  if (
    routePath === "/onboarding/invites" ||
    routePath.startsWith("/onboarding/invites/")
  ) {
    return "invitations"
  }

  if (ONBOARDING_CREATE_PATHS.has(routePath)) {
    return "create"
  }

  return tabs[0]?.value ?? "create"
}
