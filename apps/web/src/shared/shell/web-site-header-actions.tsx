"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { lazy, Suspense, useEffect, useState } from "react"
import { HeaderLanguageSelector } from "@/shared/shell/web-header-language-selector"
import { WebSiteHeaderAuth } from "@/shared/shell/web-site-header-auth"

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

export function WebSiteHeaderActions() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Suspense fallback={<IconSkeleton />}>
        {mounted ? <HeaderLanguageSelector /> : <IconSkeleton />}
      </Suspense>
      <Suspense fallback={<IconSkeleton />}>
        {mounted ? <ModeToggle /> : <IconSkeleton />}
      </Suspense>
      <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
      <Suspense fallback={<AccountMenuSkeleton />}>
        {mounted ? <WebSiteHeaderAuth /> : <AccountMenuSkeleton />}
      </Suspense>
    </>
  )
}
