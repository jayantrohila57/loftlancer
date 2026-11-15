"use client"

import Shell from "@packages/ui/components/shell"
import { SidebarTrigger } from "@packages/ui/components/sidebar"
import { Skeleton } from "@packages/ui/components/skeleton"
import type { ReactNode } from "react"
import { lazy, Suspense, useEffect, useState } from "react"
import { ShellCommandMenuTrigger } from "./shell.command-menu.trigger"

const ShellHistoryControls = lazy(() =>
  import("./shell.history-controls").then((module) => ({
    default: module.ShellHistoryControls,
  }))
)
const ShellBreadcrumbs = lazy(() =>
  import("./shell.breadcrumbs").then((module) => ({
    default: module.ShellBreadcrumbs,
  }))
)
const ModeToggle = lazy(() =>
  import("@features/theme").then((module) => ({ default: module.ModeToggle }))
)

const ShellNotifications = lazy(() =>
  import("./shell.notifications").then((module) => ({
    default: module.ShellNotifications,
  }))
)

function IconSkeleton() {
  return <Skeleton aria-hidden="true" className="size-9 sm:size-8" />
}

export function ShellHeader({
  languageSelector,
  userMenu,
}: {
  readonly languageSelector?: ReactNode
  readonly userMenu?: ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Shell.Bar>
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="size-9 md:hidden" />
        <Suspense
          fallback={
            <div className="flex flex-row items-center gap-1">
              <IconSkeleton />
              <IconSkeleton />
            </div>
          }
        >
          {mounted ? (
            <ShellHistoryControls />
          ) : (
            <div className="flex flex-row items-center gap-1">
              <IconSkeleton />
              <IconSkeleton />
            </div>
          )}
        </Suspense>
        <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
        <Suspense
          fallback={
            <Skeleton aria-hidden="true" className="hidden h-8 w-48 md:block" />
          }
        >
          {mounted ? (
            <ShellBreadcrumbs />
          ) : (
            <Skeleton aria-hidden="true" className="hidden h-8 w-48 md:block" />
          )}
        </Suspense>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {mounted ? <ShellCommandMenuTrigger /> : null}
        <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
        <Suspense fallback={<IconSkeleton />}>
          {mounted ? <ShellNotifications /> : <IconSkeleton />}
        </Suspense>
        <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
        {languageSelector && (
          <Suspense fallback={<IconSkeleton />}>
            {mounted ? languageSelector : <IconSkeleton />}
          </Suspense>
        )}
        <Suspense fallback={<IconSkeleton />}>
          {mounted ? <ModeToggle /> : <IconSkeleton />}
        </Suspense>
        {userMenu && (
          <>
            <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
            <Suspense fallback={<IconSkeleton />}>
              {mounted ? userMenu : <IconSkeleton />}
            </Suspense>
          </>
        )}
      </div>
    </Shell.Bar>
  )
}
