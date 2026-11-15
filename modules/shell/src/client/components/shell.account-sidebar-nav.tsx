"use client"

import { ShellSidebarSkeleton } from "@features/shell"
import { lazy, Suspense, useEffect, useState } from "react"

const AccountSidebarNavContent = lazy(() =>
  import("./shell.account-sidebar-nav.client").then((module) => ({
    default: module.AccountSidebarNavContent,
  }))
)

export function AccountSidebarNav() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Suspense fallback={<ShellSidebarSkeleton />}>
      {mounted ? <AccountSidebarNavContent /> : <ShellSidebarSkeleton />}
    </Suspense>
  )
}
