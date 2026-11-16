import { ShellSectionLayout, ShellSubHeader } from "@features/shell"
import { Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOnboardingSectionSubnav } from "@/shared/shell/studio-onboarding-section-subnav.client"
import { studioOnboardingSectionTabs } from "@/shared/shell/studio-onboarding-section-tabs"
import type { LangRouteParams } from "@/shared/types/studio.app.types"

export async function StudioOnboardingStepSubheader({
  params,
  tab,
  children,
}: {
  readonly params: Promise<LangRouteParams>
  readonly tab: "create" | "invitations"
  readonly children: ReactNode
}) {
  const t = await getServerTranslations(params, "ui")
  const tabs = studioOnboardingSectionTabs((key) =>
    t(key as Parameters<typeof t>[0])
  )

  const { title, description } =
    tab === "invitations"
      ? {
          title: t("organizationInvitations"),
          description: t("receivedInvitationsDescription"),
        }
      : {
          title: t("onboardingOrganizationStep"),
          description: t("onboardingCreateDescription"),
        }

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

export async function studioOnboardingCreateStepCopy(
  params: Promise<LangRouteParams>,
  step: "organization" | "plan" | "invite"
) {
  const t = await getServerTranslations(params, "ui")
  switch (step) {
    case "plan":
      return {
        title: t("onboardingPlanStep"),
        description: t("onboardingChoosePlanDescription"),
      }
    case "invite":
      return {
        title: t("onboardingInviteStep"),
        description: t("organizationTeamStepDescription"),
      }
    default:
      return {
        title: t("onboardingOrganizationStep"),
        description: t("onboardingCreateDescription"),
      }
  }
}
