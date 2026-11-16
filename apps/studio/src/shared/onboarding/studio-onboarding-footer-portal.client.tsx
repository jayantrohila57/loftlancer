"use client"

import { createPortal } from "react-dom"
import type { ReactNode } from "react"
import { useStudioOnboardingFooterMount } from "@/shared/onboarding/studio-onboarding-provider.client"

/** Renders onboarding footer actions into the shell footer mount (e.g. FormKit submit). */
export function StudioOnboardingFooterPortal({
  children,
}: {
  readonly children: ReactNode
}) {
  const mount = useStudioOnboardingFooterMount()
  if (!mount) {
    return <>{children}</>
  }
  return createPortal(children, mount)
}