import { Bell } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

export default async function Layout({ children, params }: LangLayoutProps) {
  const t = await getServerTranslations(params, "ui")
  return (
    <AuthAccountSectionLayout
      description={t("notificationsOverviewDescription")}
      icon={Bell}
      section="notifications"
      title={t("notifications")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
