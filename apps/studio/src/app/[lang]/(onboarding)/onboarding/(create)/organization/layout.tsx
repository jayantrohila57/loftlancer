import type { ReactNode } from "react"
import { StudioOnboardingCreateSubheader } from "@/shared/onboarding/studio-onboarding-create-subheader"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingOrganizationLayout({
  children,
  params,
}: LangLayoutProps & { readonly children: ReactNode }) {
  return (
    <StudioOnboardingCreateSubheader params={params} step="organization">
      {children}
    </StudioOnboardingCreateSubheader>
  )
}
