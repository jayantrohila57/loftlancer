"use client"

import {
  OrgOrganizationInvitationsScreen,
  STUDIO_ONBOARDING_INVITE_FORM_ID,
} from "@modules/org"
import { useLocale } from "next-intl"
import { finishStudioOnboardingAfterInvite } from "@/shared/onboarding/studio-onboarding.actions.server"

export function StudioOnboardingInviteStep() {
  const locale = useLocale()

  return (
    <OrgOrganizationInvitationsScreen
      formId={STUDIO_ONBOARDING_INVITE_FORM_ID}
      hideInviteSubmit
      onInviteSent={async () => {
        await finishStudioOnboardingAfterInvite(locale)
      }}
    />
  )
}
