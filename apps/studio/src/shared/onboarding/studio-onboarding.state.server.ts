import "server-only"

import { getDb } from "@packages/drizzle"
import { studioOnboardingProgress } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import {
  STUDIO_ONBOARDING_STEP_IDS,
  STUDIO_ONBOARDING_STEPS,
  studioOnboardingFirstAccessibleStep,
  studioOnboardingStepIndex,
  studioOnboardingStepPath,
} from "@/shared/onboarding/studio-onboarding.config"
import type { StudioUserOrganization } from "@/shared/org/studio-org.server"

export type StudioOnboardingPlanTier = "free" | "paid"

export type StudioOnboardingView = {
  readonly completedSteps: ReadonlySet<StudioOnboardingStepId>
  readonly currentStep: StudioOnboardingStepId
  readonly currentStepNumber: number
  readonly totalSteps: number
  readonly progressPercent: number
  readonly finished: boolean
  readonly organizationSlug: string | null
  readonly planTier: StudioOnboardingPlanTier | null
}

function parseCompletedSteps(
  raw: readonly string[] | null | undefined
): Set<StudioOnboardingStepId> {
  const completed = new Set<StudioOnboardingStepId>()
  for (const id of raw ?? []) {
    if (STUDIO_ONBOARDING_STEP_IDS.includes(id as StudioOnboardingStepId)) {
      completed.add(id as StudioOnboardingStepId)
    }
  }
  return completed
}

async function requireDb() {
  const db = getDb()
  if (!db) {
    throw new Error("Database unavailable.")
  }
  return db
}

export async function readStudioOnboardingProgressRow(userId: string) {
  const db = await requireDb()
  const [row] = await db
    .select()
    .from(studioOnboardingProgress)
    .where(eq(studioOnboardingProgress.userId, userId))
    .limit(1)
  return row ?? null
}

export function buildStudioOnboardingView(
  organizations: readonly StudioUserOrganization[],
  row: Awaited<ReturnType<typeof readStudioOnboardingProgressRow>>
): StudioOnboardingView {
  const completed = parseCompletedSteps(row?.completedSteps)
  const hasOrganization = organizations.length > 0
  if (hasOrganization) {
    completed.add("organization")
  }
  const finished = row?.finishedAt != null
  const currentStep = studioOnboardingFirstAccessibleStep(
    completed,
    hasOrganization
  )
  const currentStepNumber = studioOnboardingStepIndex(currentStep) + 1
  const totalSteps = STUDIO_ONBOARDING_STEPS.length
  const progressPercent = Math.round(
    (Math.max(0, currentStepNumber - 1) / totalSteps) * 100
  )
  const planTier =
    row?.planTier === "free" || row?.planTier === "paid" ? row.planTier : null
  return {
    completedSteps: completed,
    currentStep,
    currentStepNumber,
    totalSteps,
    progressPercent,
    finished,
    organizationSlug: organizations[0]?.slug ?? null,
    planTier,
  }
}

export async function loadStudioOnboardingView(
  userId: string,
  organizations: readonly StudioUserOrganization[]
) {
  const row = await readStudioOnboardingProgressRow(userId)
  return buildStudioOnboardingView(organizations, row)
}

export async function upsertStudioOnboardingProgress(
  userId: string,
  input: {
    readonly completedSteps: readonly StudioOnboardingStepId[]
    readonly finished?: boolean
    readonly planTier?: StudioOnboardingPlanTier | null
  }
) {
  const db = await requireDb()
  const existing = await readStudioOnboardingProgressRow(userId)
  const completedSteps = [...new Set(input.completedSteps)]
  if (existing) {
    await db
      .update(studioOnboardingProgress)
      .set({
        completedSteps,
        planTier:
          input.planTier === undefined ? existing.planTier : input.planTier,
        finishedAt: input.finished ? new Date() : existing.finishedAt,
      })
      .where(eq(studioOnboardingProgress.userId, userId))
    return
  }
  await db.insert(studioOnboardingProgress).values({
    userId,
    completedSteps,
    planTier: input.planTier ?? null,
    finishedAt: input.finished ? new Date() : null,
  })
}

export async function setStudioOnboardingPlanTier(
  userId: string,
  planTier: StudioOnboardingPlanTier
) {
  const existing = await readStudioOnboardingProgressRow(userId)
  const completedSteps = existing?.completedSteps ?? []
  await upsertStudioOnboardingProgress(userId, {
    completedSteps: completedSteps as StudioOnboardingStepId[],
    planTier,
  })
}

export async function markStudioOnboardingStepComplete(
  userId: string,
  stepId: StudioOnboardingStepId,
  organizations: readonly StudioUserOrganization[]
) {
  const view = await loadStudioOnboardingView(userId, organizations)
  const completed = new Set(view.completedSteps)
  completed.add(stepId)
  await upsertStudioOnboardingProgress(userId, {
    completedSteps: [...completed],
    finished: stepId === "invite",
  })
}

export function studioOnboardingResumePath(view: StudioOnboardingView) {
  if (view.finished && view.organizationSlug) {
    return `/${view.organizationSlug}`
  }
  return studioOnboardingStepPath(view.currentStep)
}
