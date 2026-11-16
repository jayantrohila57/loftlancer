import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@packages/ui/components/progress"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { loadStudioOnboardingView } from "@/shared/onboarding/studio-onboarding.state.server"
import { StudioOnboardingStepper } from "@/shared/onboarding/studio-onboarding-stepper.client"
import type { LangRouteParams } from "@/shared/types/studio.app.types"

export async function StudioOnboardingAside({
  params,
}: {
  readonly params: Promise<LangRouteParams>
}) {
  const { lang } = await params
  const t = await getServerTranslations(params, "ui")
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const view = await loadStudioOnboardingView(session.user.id, organizations)

  return (
    <aside className="flex min-h-0 flex-col gap-6 overflow-y-auto border-b border-border bg-background px-5 py-8 sm:px-8 md:border-r md:border-b-0 md:py-10 lg:px-10">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("onboarding")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("onboardingStepProgress", {
            current: view.currentStepNumber,
            total: view.totalSteps,
          })}
        </p>
        <Progress value={view.progressPercent}>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </div>
      <StudioOnboardingStepper
        completedSteps={[...view.completedSteps]}
        currentStep={view.currentStep}
      />
    </aside>
  )
}
