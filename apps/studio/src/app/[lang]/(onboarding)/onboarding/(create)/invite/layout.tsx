import type { ReactNode } from "react"
import { StudioOnboardingCreateSubheader } from "@/shared/onboarding/studio-onboarding-create-subheader"
import { StudioOnboardingInviteFooterClient } from "@/shared/onboarding/studio-onboarding-invite-footer.client"
import { StudioOnboardingStepFrame } from "@/shared/onboarding/studio-onboarding-step-frame"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingInviteLayout({
  children,
  params,
}: LangLayoutProps & { readonly children: ReactNode }) {
  return (
    <StudioOnboardingCreateSubheader params={params} step="invite">
      <StudioOnboardingStepFrame
        footer={<StudioOnboardingInviteFooterClient />}
      >
        {children}
      </StudioOnboardingStepFrame>
    </StudioOnboardingCreateSubheader>
  )
}
