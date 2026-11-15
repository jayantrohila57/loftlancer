import { Palette } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountAppearanceLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountAppearanceLayout({
  children,
  params,
}: AuthAccountAppearanceLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("appearanceCategorySummary")}
      icon={Palette}
      section="appearance"
      title={t("appearance")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
