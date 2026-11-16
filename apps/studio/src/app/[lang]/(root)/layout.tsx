import { ShellLayout } from "@features/shell"
import { AccountUserMenuLoader } from "@modules/shell"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { HeaderLanguageSelector } from "@/shared/shell/studio-header-language-selector"
import { StudioShellCommandMenu } from "@/shared/shell/studio-shell-command-menu"
import { StudioSidebarNav } from "@/shared/shell/studio-sidebar-nav"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

export const instant = false

export default async function StudioLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}) {
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioShellCommandMenu groupLabel={t("studio")}>
      <ShellLayout
        userMenu={<AccountUserMenuLoader />}
        languageSelector={<HeaderLanguageSelector />}
        navigation={<StudioSidebarNav />}
      >
        {children}
      </ShellLayout>
    </StudioShellCommandMenu>
  )
}
