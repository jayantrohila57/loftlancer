import { Languages } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountLanguageRegionLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountLanguageRegionLayout({
  children,
  params,
}: AuthAccountLanguageRegionLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("languageRegionCategorySummary")}
      icon={Languages}
      section="languageRegion"
      title={t("languageRegion")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
