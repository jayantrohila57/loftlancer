import type { ShellSectionTabItem } from "@features/shell"

type Translate = (key: string) => string

export function studioOnboardingSectionTabs(
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: "/onboarding/organization",
      label: t("onboardingTabCreateNew"),
      value: "create",
    },
    {
      href: "/onboarding/invites",
      label: t("organizationInvitations"),
      value: "invitations",
    },
  ]
}