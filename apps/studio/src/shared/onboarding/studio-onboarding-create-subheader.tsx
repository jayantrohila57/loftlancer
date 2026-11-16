import { ShellSectionLayout, ShellSubHeader } from "@features/shell"
import { Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import { studioOnboardingCreateStepCopy } from "@/shared/onboarding/studio-onboarding-step-subheader"
import { StudioOnboardingSectionSubnav } from "@/shared/shell/studio-onboarding-section-subnav.client"
import { studioOnboardingSectionTabs } from "@/shared/shell/studio-onboarding-section-tabs"
import type { LangRouteParams } from "@/shared/types/studio.app.types"

export async function StudioOnboardingCreateSubheader({
  params,
  step,
  children,
}: {
  readonly params: Promise<LangRouteParams>
  readonly step: StudioOnboardingStepId
  readonly children: ReactNode
}) {
  const t = await getServerTranslations(params, "ui")
  const tabs = studioOnboardingSectionTabs((key) =>
    t(key as Parameters<typeof t>[0])
  )
  const { title, description } = await studioOnboardingCreateStepCopy(
    params,
    step
  )

  return (
    <ShellSectionLayout
      header={
        <ShellSubHeader description={description} icon={Sparkles} title={title}>
          <Suspense fallback={null}>
            <StudioOnboardingSectionSubnav tabs={tabs} />
          </Suspense>
        </ShellSubHeader>
      }
    >
      {children}
    </ShellSectionLayout>
  )
}
