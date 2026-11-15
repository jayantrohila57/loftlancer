import { ShellHomeSidebarNav, ShellLayout } from "@features/shell"
import { AccountUserMenuLoader } from "@modules/shell"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/console.i18n.server"
import { HeaderLanguageSelector } from "@/shared/shell/console-header-language-selector"
import type { LangLayoutProps } from "@/shared/types/console.app.types"

export default async function ConsoleLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}) {
  const t = await getServerTranslations(params, "ui")

  return (
    <ShellLayout
      userMenu={<AccountUserMenuLoader />}
      languageSelector={<HeaderLanguageSelector />}
      navigation={
        <ShellHomeSidebarNav
          homeDescription={t("consoleHomeDescription")}
          homeLabel={t("home")}
          label={t("console")}
        />
      }
    >
      {children}
    </ShellLayout>
  )
}
