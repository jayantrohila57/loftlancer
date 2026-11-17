"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { lazy, Suspense, useEffect, useState } from "react"

const AuthAccountSidebarNavContent = lazy(() =>
  import("./auth-account-sidebar-nav.client").then((module) => ({
    default: module.AuthAccountSidebarNavContent,
  }))
)

function ShellSidebarSkeleton() {
  return (
    <div className="space-y-2 px-2 py-1">
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function AuthAccountSidebarNav() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Suspense fallback={<ShellSidebarSkeleton />}>
      {mounted ? <AuthAccountSidebarNavContent /> : <ShellSidebarSkeleton />}
    </Suspense>
  )
}
