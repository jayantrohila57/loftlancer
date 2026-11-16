"use server"

import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import {
  billingBeginDowngradeService,
  billingBeginUpgradeService,
} from "@modules/billing/server"
import { studioOnboardingPlanCheckoutReturnUrls } from "@modules/billing/utils/billing.checkout-return-url"
import {
  listStudioOrganizationsForSession,
  requireStudioAccess,
} from "@/shared/auth/studio.session"
import { serverEnv } from "@/shared/config/studio.server-env"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import {
  studioOnboardingCanAccessStep,
  studioOnboardingStepPath,
} from "@/shared/onboarding/studio-onboarding.config"
import {
  loadStudioOnboardingView,
  markStudioOnboardingStepComplete,
  setStudioOnboardingPlanTier,
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

export async function continueStudioOnboardingPlan(
  lang: string,
  planTier: "free" | "paid"
) {
  const { session, organizations } = await guardOnboardingStep(lang, "plan")
  const organization = organizations[0]
  if (!organization) {
    redirectStudio(lang, "/onboarding/organization")
  }

  await setStudioOnboardingPlanTier(session.user.id, planTier)
  const returnUrls = studioOnboardingPlanCheckoutReturnUrls({
    origin: serverEnv.APP_PUBLIC_URL,
    lang,
  })

  if (planTier === "free") {
    const downgrade = await billingBeginDowngradeService({
      organizationId: organization.id,
      actorUserId: session.user.id,
      successUrl: returnUrls.successUrl,
      cancelUrl: returnUrls.cancelUrl,
    })
    if (downgrade.data.paymentUrl) {
      redirectToExternalDestination(downgrade.data.paymentUrl)
    }
    await markStudioOnboardingStepComplete(
      session.user.id,
      "plan",
      organizations
    )
    redirectStudio(lang, "/onboarding/invite")
  }

  const upgrade = await billingBeginUpgradeService({
    organizationId: organization.id,
    actorUserId: session.user.id,
    successUrl: returnUrls.successUrl,
    cancelUrl: returnUrls.cancelUrl,
  })
  if (upgrade.data?.paymentUrl) {
    redirectToExternalDestination(upgrade.data.paymentUrl)
  }
  await markStudioOnboardingStepComplete(session.user.id, "plan", organizations)
  redirectStudio(lang, "/onboarding/invite")
}

export async function completeStudioOnboardingPlanCheckout(lang: string) {
  const { session, organizations } = await guardOnboardingStep(lang, "plan")
  await setStudioOnboardingPlanTier(session.user.id, "paid")
  await markStudioOnboardingStepComplete(session.user.id, "plan", organizations)
  redirectStudio(lang, "/onboarding/invite")
}

export async function skipStudioOnboardingInviteStep(lang: string) {
  await finishStudioOnboarding(lang)
}

export async function finishStudioOnboardingAfterInvite(lang: string) {
  await finishStudioOnboarding(lang)
}

async function finishStudioOnboarding(lang: string) {
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
