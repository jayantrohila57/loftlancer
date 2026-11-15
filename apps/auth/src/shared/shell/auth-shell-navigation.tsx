"use client"

import type { ShellNavigationBindings } from "@features/shell"
import { ShellNavigationProvider } from "@features/shell"
import type { ReactNode } from "react"
import { Link, usePathname, useRouter } from "@/shared/i18n/auth.i18n"

export function AuthShellNavigationProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <ShellNavigationProvider
      Link={Link}
      usePathname={usePathname}
      useRouter={useRouter as ShellNavigationBindings["useRouter"]}
    >
      {children}
    </ShellNavigationProvider>
  )
}
