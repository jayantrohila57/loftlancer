"use client"

import { useTranslations } from "next-intl"
import { StudioOnboardingRegisterActions } from "@/shared/onboarding/studio-onboarding-register-actions.client"
import { StudioOnboardingSkip } from "@/shared/onboarding/studio-onboarding-steps"

export function StudioOnboardingInviteFooterActions({
  organizationSlug,
}: {
  readonly organizationSlug: string
}) {
  const t = useTranslations("ui")
  return (
    <StudioOnboardingRegisterActions>
      <StudioOnboardingSkip
        href={`/${organizationSlug}`}
        label={t("skipThisStep")}
      />
    </StudioOnboardingRegisterActions>
  )
}