"use client"

import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding-steps"
import {
  resolveStudioOnboardingSectionTabFromPathname,
  resolveStudioOnboardingStepFromPathname,
} from "@/shared/onboarding/studio-onboarding-route.utils"

type StudioOnboardingContextValue = {
  readonly step: StudioOnboardingStepId | null
  readonly sectionTab: "create" | "invitations"
  readonly organizationSlug: string | null
  readonly setOrganizationSlug: Dispatch<SetStateAction<string | null>>
  readonly actions: ReactNode
  readonly setActions: (actions: ReactNode) => void
  readonly footerMount: HTMLElement | null
  readonly setFooterMount: (node: HTMLElement | null) => void
}

const StudioOnboardingContext =
  createContext<StudioOnboardingContextValue | null>(null)

export function StudioOnboardingProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const pathname = usePathname()
  const routePath = stripLeadingLocaleFromPathname(pathname)

  const step = useMemo(
    () => resolveStudioOnboardingStepFromPathname(pathname),
    [pathname]
  )
  const sectionTab = useMemo(
    () => resolveStudioOnboardingSectionTabFromPathname(pathname),
    [pathname]
  )

  const [organizationSlug, setOrganizationSlug] = useState<string | null>(null)
  const [actions, setActionsState] = useState<ReactNode>(null)
  const [footerMount, setFooterMount] = useState<HTMLElement | null>(null)

  const setActions = useCallback((node: ReactNode) => {
    setActionsState(node)
  }, [])

  useEffect(() => {
    setActionsState(null)
  }, [routePath])

  const value = useMemo<StudioOnboardingContextValue>(
    () => ({
      step,
      sectionTab,
      organizationSlug,
      setOrganizationSlug,
      actions,
      setActions,
      footerMount,
      setFooterMount,
    }),
    [
      step,
      sectionTab,
      organizationSlug,
      actions,
      setActions,
      footerMount,
    ]
  )

  return (
    <StudioOnboardingContext.Provider value={value}>
      {children}
    </StudioOnboardingContext.Provider>
  )
}

function useStudioOnboardingContext() {
  const value = useContext(StudioOnboardingContext)
  if (!value) {
    throw new Error(
      "Studio onboarding hooks must be used within StudioOnboardingProvider"
    )
  }
  return value
}

export function useStudioOnboarding() {
  return useStudioOnboardingContext()
}

export function useStudioOnboardingStep() {
  return useStudioOnboardingContext().step
}

export function useStudioOnboardingSectionTab() {
  return useStudioOnboardingContext().sectionTab
}

export function useStudioOnboardingActions() {
  const { actions, setActions } = useStudioOnboardingContext()
  return { actions, setActions }
}

export function useStudioOnboardingFooterMount() {
  return useStudioOnboardingContext().footerMount
}