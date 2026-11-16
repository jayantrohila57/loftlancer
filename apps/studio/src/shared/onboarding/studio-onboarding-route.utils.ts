import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding-steps"

export function resolveStudioOnboardingStepFromPathname(
  pathname: string
): StudioOnboardingStepId | null {
  const routePath = stripLeadingLocaleFromPathname(pathname)
  if (
    routePath === "/onboarding" ||
    routePath === "/onboarding/organization"
  ) {
    return "organization"
  }
  if (routePath === "/onboarding/plan") {
    return "plan"
  }
  if (routePath === "/onboarding/invite") {
    return "invite"
  }
  return null
}

export function resolveStudioOnboardingSectionTabFromPathname(
  pathname: string
): "create" | "invitations" {
  const routePath = stripLeadingLocaleFromPathname(pathname)
  if (
    routePath === "/onboarding/invites" ||
    routePath.startsWith("/onboarding/invites/")
  ) {
    return "invitations"
  }
  return "create"
}