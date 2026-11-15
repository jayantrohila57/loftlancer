import { Building2 } from "lucide-react"
import { hasLocale } from "next-intl"
import type { ReactNode } from "react"
import { requireAccountSession } from "@/shared/auth/auth.session"
import { appI18n, redirect } from "@/shared/i18n/auth.i18n"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountOrganizationLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountOrganizationLayout({
  children,
  params,
}: AuthAccountOrganizationLayoutProps) {
  const [session, { lang }] = await Promise.all([
    requireAccountSession(params),
    params,
  ])
  if (
    !("activeOrganizationId" in session.session) ||
    !session.session.activeOrganizationId
  ) {
    if (!hasLocale(appI18n.routing.locales, lang)) return null
    redirect({ href: "/organizations/list", locale: lang })
  }
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("organizationCategorySummary")}
      icon={Building2}
      section="organization"
      title={t("organization")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
