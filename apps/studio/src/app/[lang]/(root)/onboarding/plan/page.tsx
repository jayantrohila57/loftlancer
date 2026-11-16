import { BillingPlansScreen } from "@modules/billing"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import {
  StudioOnboardingSkip,
  StudioOnboardingSteps,
} from "@/shared/onboarding/studio-onboarding-steps"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPlanPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await listStudioOrganizationsForSession(lang)
  if (organizations.length === 0) {
    redirectStudio(lang, "/onboarding/organization")
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("onboardingPlanStep")}
      description={t("onboardingChoosePlanDescription")}
    >
      <StudioOnboardingSteps current="plan" />
      <BillingPlansScreen />
      <div className="flex flex-wrap gap-2">
        <StudioOnboardingSkip
          href="/onboarding/invite"
          label={t("continueToInvite")}
        />
        <StudioOnboardingSkip href="/onboarding/invite" label={t("skip")} />
      </div>
    </StudioPageSection>
  )
}
