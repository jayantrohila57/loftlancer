import { StudioOnboardingContentHeader } from "@/shared/onboarding/studio-onboarding-content-header.client"
import { StudioOnboardingContentShell } from "@/shared/onboarding/studio-onboarding-content-shell.client"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingRoutesLayout({
  children,
}: LangLayoutProps) {
  return (
    <>
      <StudioOnboardingContentHeader />
      <StudioOnboardingContentShell>{children}</StudioOnboardingContentShell>
    </>
  )
}