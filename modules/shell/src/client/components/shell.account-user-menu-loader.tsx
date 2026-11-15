"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { lazy, Suspense } from "react"

const UserMenu = lazy(() =>
  import("./shell.account-user-menu").then((module) => ({
    default: module.AccountUserMenu,
  }))
)

export function AccountUserMenuLoader() {
  return (
    <Suspense
      fallback={
        <Skeleton
          aria-hidden="true"
          className="size-9 rounded-full sm:size-8"
        />
      }
    >
      <UserMenu />
    </Suspense>
  )
}
