import { requireStudioOnboardingStep } from "@/shared/onboarding/studio-onboarding.guard.server"
import { StudioOnboardingInviteStep } from "@/shared/onboarding/studio-onboarding-invite-step.client"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingInvitePage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { organizations } = await requireStudioOnboardingStep(lang, "invite")
  if (!organizations[0]?.slug) {
    return null
  }
  return <StudioOnboardingInviteStep />
}
