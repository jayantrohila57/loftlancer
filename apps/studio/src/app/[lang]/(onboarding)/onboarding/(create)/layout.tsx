import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"
import { StudioOnboardingAside } from "@/shared/onboarding/studio-onboarding-aside"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export default function StudioOnboardingCreateLayout({
  children,
  params,
}: LangLayoutProps & { readonly children: ReactNode }) {
  return (
    <Shell.Section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      variant="site"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:grid-rows-1">
        <StudioOnboardingAside params={params} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </Shell.Section>
  )
}
