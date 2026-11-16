import { BillingPlansScreen } from "@modules/billing"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { StudioOnboardingPlanFooterActions } from "@/shared/onboarding/studio-onboarding-plan-footer-actions.client"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPlanPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await listStudioOrganizationsForSession(lang)
  if (organizations.length === 0) {
    redirectStudio(lang, "/onboarding/organization")
  }
  return (
    <>
      <StudioOnboardingPlanFooterActions />
      <BillingPlansScreen />
    </>
  )
}