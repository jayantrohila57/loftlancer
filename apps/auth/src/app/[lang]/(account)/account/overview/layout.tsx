import { ShellNavigationButton } from "@features/shell"
import { LayoutDashboard } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountOverviewLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountOverviewLayout({
  children,
  params,
}: AuthAccountOverviewLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      action={
        <ShellNavigationButton
          href="/account/profile"
          label={t("openProfile")}
        />
      }
      description={t("seeYourAccountAtAGlance")}
      icon={LayoutDashboard}
      section="overview"
      title={t("overview")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
