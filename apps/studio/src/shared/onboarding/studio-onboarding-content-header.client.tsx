"use client"

import { ShellSubHeader } from "@features/shell"
import { Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import {
  useStudioOnboardingSectionTab,
  useStudioOnboardingStep,
} from "@/shared/onboarding/studio-onboarding-provider.client"
import { StudioOnboardingSectionSubnav } from "@/shared/shell/studio-onboarding-section-subnav.client"
import { studioOnboardingSectionTabs } from "@/shared/shell/studio-onboarding-section-tabs"

export function StudioOnboardingContentHeader() {
  const t = useTranslations("ui")
  const step = useStudioOnboardingStep()
  const sectionTab = useStudioOnboardingSectionTab()
  const tabs = useMemo(
    () =>
      studioOnboardingSectionTabs((key) =>
        t(key as Parameters<typeof t>[0])
      ),
    [t]
  )

  const { title, description } = useMemo(() => {
    if (sectionTab === "invitations") {
      return {
        title: t("organizationInvitations"),
        description: t("receivedInvitationsDescription"),
      }
    }
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
      case "organization":
      default:
        return {
          title: t("onboardingOrganizationStep"),
          description: t("onboardingCreateDescription"),
        }
    }
  }, [sectionTab, step, t])

  return (
    <ShellSubHeader description={description} icon={Sparkles} title={title}>
      <StudioOnboardingSectionSubnav tabs={tabs} />
    </ShellSubHeader>
  )
}