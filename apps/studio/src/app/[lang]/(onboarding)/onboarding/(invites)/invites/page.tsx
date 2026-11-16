import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import {
  loadStudioOnboardingView,
  studioOnboardingResumePath,
} from "@/shared/onboarding/studio-onboarding.state.server"
import { StudioOnboardingInvitations } from "@/shared/onboarding/studio-onboarding-invitations.client"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingInvitesPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const existing = organizations[0]
  if (existing) {
    const view = await loadStudioOnboardingView(session.user.id, organizations)
    redirectStudio(
      lang,
      view.finished ? `/${existing.slug}` : studioOnboardingResumePath(view)
    )
  }
  return <StudioOnboardingInvitations />
}
