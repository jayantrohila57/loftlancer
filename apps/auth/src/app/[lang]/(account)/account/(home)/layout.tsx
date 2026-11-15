import { LayoutGrid } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountHomeLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountHomeLayout({
  children,
  params,
}: AuthAccountHomeLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("browseAccountAreasAndOpenAPage")}
      icon={LayoutGrid}
      section="home"
      title={t("account")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
