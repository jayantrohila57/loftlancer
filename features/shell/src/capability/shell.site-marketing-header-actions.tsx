"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import type { ReactNode } from "react"
import { lazy, Suspense, useEffect, useState } from "react"

const ModeToggle = lazy(() =>
  import("@features/theme").then((module) => ({ default: module.ModeToggle }))
)

function IconSkeleton() {
  return <Skeleton aria-hidden="true" className="size-9 sm:size-8" />
}

function AccountMenuSkeleton() {
  return (
    <Skeleton aria-hidden="true" className="size-9 rounded-full sm:size-8" />
  )
}

export interface SiteMarketingHeaderActionsProps {
  readonly languageSelector?: ReactNode
  readonly userMenu?: ReactNode
}

/** Locale, theme, and account actions for marketing site headers (no command menu). */
export function SiteMarketingHeaderActions({
  languageSelector,
  userMenu,
}: SiteMarketingHeaderActionsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {languageSelector ? (
        <Suspense fallback={<IconSkeleton />}>
          {mounted ? languageSelector : <IconSkeleton />}
        </Suspense>
      ) : null}
      <Suspense fallback={<IconSkeleton />}>
        {mounted ? <ModeToggle /> : <IconSkeleton />}
      </Suspense>
      {userMenu ? (
        <>
          <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
          <Suspense fallback={<AccountMenuSkeleton />}>
            {mounted ? userMenu : <AccountMenuSkeleton />}
          </Suspense>
        </>
      ) : null}
    </>
  )
}