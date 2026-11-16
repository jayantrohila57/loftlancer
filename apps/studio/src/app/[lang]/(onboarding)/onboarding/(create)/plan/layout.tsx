import type { ReactNode } from "react"
import { StudioOnboardingCreateSubheader } from "@/shared/onboarding/studio-onboarding-create-subheader"
import { StudioOnboardingStepFrame } from "@/shared/onboarding/studio-onboarding-step-frame"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingPlanLayout({
  children,
  params,
}: LangLayoutProps & { readonly children: ReactNode }) {
  return (
    <StudioOnboardingCreateSubheader params={params} step="plan">
      <StudioOnboardingStepFrame>{children}</StudioOnboardingStepFrame>
    </StudioOnboardingCreateSubheader>
  )
}
