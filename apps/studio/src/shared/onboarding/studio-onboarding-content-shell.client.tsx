"use client"

import {
  useCallback,
  type ReactNode,
  type RefCallback,
} from "react"
import { useStudioOnboarding } from "@/shared/onboarding/studio-onboarding-provider.client"
import { StudioOnboardingPageFooter } from "@/shared/shell/studio-onboarding-page-footer"

export function StudioOnboardingContentShell({
  children,
}: {
  readonly children: ReactNode
}) {
  const { sectionTab, actions, setFooterMount } = useStudioOnboarding()
  const setFooterMountRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      setFooterMount(node)
    },
    [setFooterMount]
  )

  if (sectionTab === "invitations") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
      <StudioOnboardingPageFooter>
        <div
          ref={setFooterMountRef}
          className="flex w-full flex-wrap items-center justify-end gap-2"
        >
          {actions}
        </div>
      </StudioOnboardingPageFooter>
    </div>
  )
}