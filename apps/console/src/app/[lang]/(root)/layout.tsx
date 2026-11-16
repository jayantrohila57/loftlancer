import { ShellLayout } from "@features/shell"
import { AccountUserMenuLoader } from "@modules/shell"
import type { ReactNode } from "react"
import { HeaderLanguageSelector } from "@/shared/shell/console-header-language-selector"
import { ConsoleSidebarNav } from "@/shared/shell/console-sidebar-nav"
import type { LangLayoutProps } from "@/shared/types/console.app.types"

export const instant = false

export default async function ConsoleLayout({
  children,
}: {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}) {
  return (
    <ShellLayout
      userMenu={<AccountUserMenuLoader />}
      languageSelector={<HeaderLanguageSelector />}
      navigation={<ConsoleSidebarNav />}
    >
      {children}
    </ShellLayout>
  )
}
