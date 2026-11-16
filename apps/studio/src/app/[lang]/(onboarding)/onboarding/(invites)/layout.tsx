import type { ReactNode } from "react"
import { StudioOnboardingStepFrame } from "@/shared/onboarding/studio-onboarding-step-frame"
import { StudioOnboardingStepSubheader } from "@/shared/onboarding/studio-onboarding-step-subheader"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingInvitesLayout({
  children,
  params,
}: LangLayoutProps & { readonly children: ReactNode }) {
  return (
    <StudioOnboardingStepSubheader params={params} tab="invitations">
      <StudioOnboardingStepFrame>{children}</StudioOnboardingStepFrame>
    </StudioOnboardingStepSubheader>
  )
}
