"use client"

import { STUDIO_ONBOARDING_INVITE_FORM_ID } from "@modules/org"
import { Button } from "@packages/ui/components/button"
import { useLocale, useTranslations } from "next-intl"
import {
  goToStudioOnboardingPlanStep,
  skipStudioOnboardingInviteStep,
} from "@/shared/onboarding/studio-onboarding.actions.server"

export function StudioOnboardingInviteFooterClient() {
  const locale = useLocale()
  const t = useTranslations("ui")

  return (
    <>
      <form action={goToStudioOnboardingPlanStep.bind(null, locale)}>
        <Button type="submit" variant="outline">
          {t("goBack")}
        </Button>
      </form>
      <form action={skipStudioOnboardingInviteStep.bind(null, locale)}>
        <Button type="submit" variant="outline">
          {t("skipThisStep")}
        </Button>
      </form>
      <Button type="submit" form={STUDIO_ONBOARDING_INVITE_FORM_ID}>
        {t("organizationInviteSubmit")}
      </Button>
    </>
  )
}
