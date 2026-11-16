"use client"

import { useLayoutEffect, type ReactNode } from "react"
import { useStudioOnboardingActions } from "@/shared/onboarding/studio-onboarding-provider.client"

/** Registers step footer actions with the onboarding shell until unmount. */
export function StudioOnboardingRegisterActions({
  children,
}: {
  readonly children: ReactNode
}) {
  const { setActions } = useStudioOnboardingActions()
  useLayoutEffect(() => {
    setActions(children)
    return () => setActions(null)
  }, [children, setActions])
  return null
}