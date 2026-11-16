import { OrgOrganizationInvitationsScreen } from "@modules/org"
import { requireStudioOnboardingStep } from "@/shared/onboarding/studio-onboarding.guard.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingInvitePage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await requireStudioOnboardingStep(lang, "invite")
  const slug = organizations[0]?.slug
  if (!slug) {
    return null
  }
  return <OrgOrganizationInvitationsScreen />
}
