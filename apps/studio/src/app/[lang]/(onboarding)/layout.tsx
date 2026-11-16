import { SHELL_MAIN_CONTENT_ID } from "@features/shell"
import Shell from "@packages/ui/components/shell"
import { StudioOnboardingHeader } from "@/shared/shell/studio-onboarding-header"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export const instant = false

export default function StudioOnboardingLayout({ children }: LangLayoutProps) {
  return (
    <Shell>
      <Shell.Frame
        className="flex h-dvh flex-col overflow-hidden"
        variant="site"
      >
        <StudioOnboardingHeader />
        <Shell.Inset
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          variant="site"
        >
          <Shell.Main
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            id={SHELL_MAIN_CONTENT_ID}
            tabIndex={-1}
            variant="site"
          >
            <Shell.Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Shell.Scroll className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {children}
              </Shell.Scroll>
            </Shell.Panel>
          </Shell.Main>
        </Shell.Inset>
      </Shell.Frame>
    </Shell>
  )
}
