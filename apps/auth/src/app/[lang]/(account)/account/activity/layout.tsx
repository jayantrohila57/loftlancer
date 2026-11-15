import { Activity } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountActivityLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountActivityLayout({
  children,
  params,
}: AuthAccountActivityLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t("reviewSupportedAccountChangesRecordedOnTheServer")}
      icon={Activity}
      section="activity"
      title={t("activity")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
