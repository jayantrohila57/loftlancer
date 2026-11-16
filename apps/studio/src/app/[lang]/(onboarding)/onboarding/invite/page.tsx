import { OrgOrganizationInvitationsScreen } from "@modules/org"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { StudioOnboardingInviteFooterActions } from "@/shared/onboarding/studio-onboarding-invite-footer-actions.client"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
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
  return (
    <>
      <StudioOnboardingInviteFooterActions organizationSlug={slug} />
      <OrgOrganizationInvitationsScreen />
    </>
  )
}