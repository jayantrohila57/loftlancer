"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { lazy, Suspense } from "react"

const ShellOrgSwitcher = lazy(() =>
  import("./shell.org-switcher.client").then((module) => ({
    default: module.ShellOrgSwitcher,
  }))
)

export function ShellOrgSwitcherLoader() {
  return (
    <Suspense
      fallback={
        <Skeleton
          aria-hidden="true"
          className="h-8 w-full rounded-lg group-data-[collapsible=icon]:size-8"
        />
      }
    >
      <ShellOrgSwitcher />
    </Suspense>
  )
}
