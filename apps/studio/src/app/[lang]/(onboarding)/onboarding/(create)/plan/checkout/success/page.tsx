import { completeStudioOnboardingPlanCheckout } from "@/shared/onboarding/studio-onboarding.actions.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPlanCheckoutSuccessPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await completeStudioOnboardingPlanCheckout(lang)
}
