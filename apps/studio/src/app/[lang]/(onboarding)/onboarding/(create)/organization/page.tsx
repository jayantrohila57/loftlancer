import { StudioCreateOrganizationForm } from "@/shared/onboarding/studio-create-organization-form"
import { requireStudioOnboardingStep } from "@/shared/onboarding/studio-onboarding.guard.server"
import { StudioOnboardingStepFrame } from "@/shared/onboarding/studio-onboarding-step-frame"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingOrganizationPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioOnboardingStep(lang, "organization")
  return (
    <StudioOnboardingStepFrame>
      <StudioCreateOrganizationForm />
    </StudioOnboardingStepFrame>
  )
}
