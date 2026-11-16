export const STUDIO_ONBOARDING_STEPS = [
  {
    id: "organization",
    path: "/onboarding/organization",
    labelKey: "onboardingOrganizationStep",
    descriptionKey: "onboardingOrganizationStepDescription",
  },
  {
    id: "plan",
    path: "/onboarding/plan",
    labelKey: "onboardingPlanStep",
    descriptionKey: "onboardingPlanStepDescription",
  },
  {
    id: "invite",
    path: "/onboarding/invite",
    labelKey: "onboardingInviteStep",
    descriptionKey: "onboardingInviteStepDescription",
  },
] as const

export type StudioOnboardingStepId =
  (typeof STUDIO_ONBOARDING_STEPS)[number]["id"]

export const STUDIO_ONBOARDING_STEP_IDS: readonly StudioOnboardingStepId[] =
  STUDIO_ONBOARDING_STEPS.map((step) => step.id)

export function studioOnboardingStepIndex(stepId: StudioOnboardingStepId) {
  return STUDIO_ONBOARDING_STEPS.findIndex((step) => step.id === stepId)
}

export function studioOnboardingStepPath(stepId: StudioOnboardingStepId) {
  const step = STUDIO_ONBOARDING_STEPS.find((item) => item.id === stepId)
  return step?.path ?? STUDIO_ONBOARDING_STEPS[0].path
}

export function studioOnboardingFirstAccessibleStep(
  completed: ReadonlySet<StudioOnboardingStepId>,
  hasOrganization: boolean
): StudioOnboardingStepId {
  if (!hasOrganization || !completed.has("organization")) {
    return "organization"
  }
  if (!completed.has("plan")) {
    return "plan"
  }
  if (!completed.has("invite")) {
    return "invite"
  }
  return "invite"
}

export function studioOnboardingCanAccessStep(
  stepId: StudioOnboardingStepId,
  completed: ReadonlySet<StudioOnboardingStepId>,
  hasOrganization: boolean
) {
  const first = studioOnboardingFirstAccessibleStep(completed, hasOrganization)
  const stepIndex = studioOnboardingStepIndex(stepId)
  const firstIndex = studioOnboardingStepIndex(first)
  return stepIndex <= firstIndex
}
