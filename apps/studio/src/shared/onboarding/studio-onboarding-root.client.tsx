"use client"

import Shell from "@packages/ui/components/shell"
import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import {
  StudioOnboardingProvider,
  useStudioOnboardingSectionTab,
  useStudioOnboardingStep,
} from "@/shared/onboarding/studio-onboarding-provider.client"
import { StudioOnboardingSteps } from "@/shared/onboarding/studio-onboarding-steps"

function StudioOnboardingAside() {
  const t = useTranslations("ui")
  const step = useStudioOnboardingStep()
  const sectionTab = useStudioOnboardingSectionTab()
  const showStepper = sectionTab === "create" && step != null

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col gap-6 overflow-y-auto border-b border-border bg-background px-5 py-8 sm:px-8 md:border-r md:border-b-0 md:py-10 lg:px-10",
        !showStepper && sectionTab === "invitations" && "hidden md:flex"
      )}
    >
      {showStepper && step ? (
        <>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("onboarding")}
          </p>
          <StudioOnboardingSteps current={step} orientation="vertical" />
        </>
      ) : null}
    </aside>
  )
}

function StudioOnboardingLayoutGrid({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <Shell.Section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      variant="site"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:grid-rows-1">
        <StudioOnboardingAside />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </Shell.Section>
  )
}

export function StudioOnboardingRoot({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <StudioOnboardingProvider>
      <StudioOnboardingLayoutGrid>{children}</StudioOnboardingLayoutGrid>
    </StudioOnboardingProvider>
  )
}