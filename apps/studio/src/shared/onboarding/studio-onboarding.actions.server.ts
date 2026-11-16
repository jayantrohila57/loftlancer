"use server"

import {
  listStudioOrganizationsForSession,
  requireStudioAccess,
} from "@/shared/auth/studio.session"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import {
  studioOnboardingCanAccessStep,
  studioOnboardingStepPath,
} from "@/shared/onboarding/studio-onboarding.config"
import {
  loadStudioOnboardingView,
  markStudioOnboardingStepComplete,
  upsertStudioOnboardingProgress,
} from "@/shared/onboarding/studio-onboarding.state.server"
import { redirectStudio } from "@/shared/org/studio-org.redirect"

async function guardOnboardingStep(
  lang: string,
  stepId: StudioOnboardingStepId
) {
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const view = await loadStudioOnboardingView(session.user.id, organizations)
  if (view.finished && view.organizationSlug) {
    redirectStudio(lang, `/${view.organizationSlug}`)
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
  return { session, organizations, view }
}

export async function completeStudioOnboardingPlanStep(lang: string) {
  await guardOnboardingStep(lang, "plan")
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  await markStudioOnboardingStepComplete(session.user.id, "plan", organizations)
  redirectStudio(lang, "/onboarding/invite")
}

export async function skipStudioOnboardingPlanStep(lang: string) {
  await completeStudioOnboardingPlanStep(lang)
}

export async function completeStudioOnboardingInviteStep(lang: string) {
  const { session, organizations, view } = await guardOnboardingStep(
    lang,
    "invite"
  )
  const slug = view.organizationSlug ?? organizations[0]?.slug
  if (!slug) {
    redirectStudio(lang, "/onboarding/organization")
  }
  await markStudioOnboardingStepComplete(
    session.user.id,
    "invite",
    organizations
  )
  redirectStudio(lang, `/${slug}`)
}

export async function goToStudioOnboardingPlanStep(lang: string) {
  await requireStudioAccess(lang)
  redirectStudio(lang, "/onboarding/plan")
}

export async function syncStudioOnboardingAfterOrganizationCreate(
  lang: string
) {
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  if (organizations.length === 0) {
    return
  }
  const view = await loadStudioOnboardingView(session.user.id, organizations)
  const completed = new Set(view.completedSteps)
  completed.add("organization")
  await upsertStudioOnboardingProgress(session.user.id, {
    completedSteps: [...completed],
  })
}
