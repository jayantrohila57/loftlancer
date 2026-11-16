import { BillingPlansScreen } from "@modules/billing"
import { requireStudioOnboardingStep } from "@/shared/onboarding/studio-onboarding.guard.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPlanPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioOnboardingStep(lang, "plan")
  return <BillingPlansScreen />
}
