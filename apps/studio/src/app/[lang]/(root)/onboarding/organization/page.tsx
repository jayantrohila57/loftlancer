import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioCreateOrganizationForm } from "@/shared/onboarding/studio-create-organization-form"
import { StudioOnboardingSteps } from "@/shared/onboarding/studio-onboarding-steps"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingOrganizationPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await listStudioOrganizationsForSession(lang)
  const existing = organizations[0]
  if (existing) {
    redirectStudio(lang, `/${existing.slug}`)
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("onboardingOrganizationStep")}
      description={t("onboardingCreateDescription")}
    >
      <StudioOnboardingSteps current="organization" />
      <StudioCreateOrganizationForm nextPath="plan" />
    </StudioPageSection>
  )
}
