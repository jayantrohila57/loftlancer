import { requireStudioOnboardingStep } from "@/shared/onboarding/studio-onboarding.guard.server"
import { StudioOnboardingPlanStep } from "@/shared/onboarding/studio-onboarding-plan-step.client"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPlanPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioOnboardingStep(lang, "plan")
  return <StudioOnboardingPlanStep />
}
