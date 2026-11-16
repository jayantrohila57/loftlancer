import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { StudioOnboardingInvitations } from "@/shared/onboarding/studio-onboarding-invitations.client"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingInvitesPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await listStudioOrganizationsForSession(lang)
  const existing = organizations[0]
  if (existing) {
    redirectStudio(lang, `/${existing.slug}`)
  }
  return <StudioOnboardingInvitations />
}