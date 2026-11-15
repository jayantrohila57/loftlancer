import { Shield } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountSecurityLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountSecurityLayout({
  children,
  params,
}: AuthAccountSecurityLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("manageYourSessionsAndConnectedSignInAccounts")}
      icon={Shield}
      section="security"
      title={t("security")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
