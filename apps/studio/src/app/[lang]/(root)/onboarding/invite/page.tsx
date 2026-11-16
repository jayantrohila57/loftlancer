import { OrgOrganizationInvitationsScreen } from "@modules/org"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import {
  StudioOnboardingSkip,
  StudioOnboardingSteps,
} from "@/shared/onboarding/studio-onboarding-steps"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingInvitePage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await listStudioOrganizationsForSession(lang)
  const slug = organizations[0]?.slug
  if (!slug) {
    redirectStudio(lang, "/onboarding/organization")
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("onboardingInviteStep")}
      description={t("organizationTeamStepDescription")}
    >
      <StudioOnboardingSteps current="invite" />
      <OrgOrganizationInvitationsScreen />
      <StudioOnboardingSkip href={`/${slug}`} label={t("skipThisStep")} />
    </StudioPageSection>
  )
}
