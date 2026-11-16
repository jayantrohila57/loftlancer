import type { ReactNode } from "react"
import { StudioOnboardingPageFooter } from "@/shared/shell/studio-onboarding-page-footer"

export function StudioOnboardingStepFrame({
  children,
  footer,
}: {
  readonly children: ReactNode
  readonly footer?: ReactNode
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
      {footer ? (
        <StudioOnboardingPageFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        </StudioOnboardingPageFooter>
      ) : null}
    </div>
  )
}
