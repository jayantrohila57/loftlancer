import "server-only"

import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import {
  studioOnboardingCanAccessStep,
  studioOnboardingStepPath,
} from "@/shared/onboarding/studio-onboarding.config"
import {
  loadStudioOnboardingView,
  studioOnboardingResumePath,
} from "@/shared/onboarding/studio-onboarding.state.server"
import { redirectStudio } from "@/shared/org/studio-org.redirect"

export async function requireStudioOnboardingStep(
  lang: string,
  stepId: StudioOnboardingStepId
) {
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const view = await loadStudioOnboardingView(session.user.id, organizations)

  if (view.finished && view.organizationSlug) {
    redirectStudio(lang, `/${view.organizationSlug}`)
  }

  if (stepId === "organization" && organizations.length > 0) {
    redirectStudio(lang, studioOnboardingStepPath(view.currentStep))
  }

  if (
    !studioOnboardingCanAccessStep(
      stepId,
      view.completedSteps,
      organizations.length > 0
    )
  ) {
    redirectStudio(lang, studioOnboardingStepPath(view.currentStep))
  }

  if (stepId === "plan" && organizations.length === 0) {
    redirectStudio(lang, "/onboarding/organization")
  }

  if (stepId === "invite") {
    const slug = organizations[0]?.slug
    if (!slug) {
      redirectStudio(lang, "/onboarding/organization")
    }
  }

  return { session, organizations, view }
}

export async function redirectStudioOnboardingEntry(lang: string) {
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const view = await loadStudioOnboardingView(session.user.id, organizations)
  redirectStudio(lang, studioOnboardingResumePath(view))
}
