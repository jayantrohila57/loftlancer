import { User } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountProfileLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountProfileLayout({
  children,
  params,
}: AuthAccountProfileLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t(
        "manageYourPersonalInformationAndHowYourAccountIsRepresented"
      )}
      icon={User}
      section="profile"
      title={t("profile")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
