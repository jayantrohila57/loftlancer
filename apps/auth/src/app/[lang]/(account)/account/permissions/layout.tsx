import { LockKeyhole } from "lucide-react"
import type { ReactNode } from "react"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSectionLayout } from "@/shared/shell/auth-account-section-layout"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

interface AuthAccountPermissionsLayoutProps {
  readonly children: ReactNode
  readonly params: LangLayoutProps["params"]
}

export default async function AuthAccountPermissionsLayout({
  children,
  params,
}: AuthAccountPermissionsLayoutProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <AuthAccountSectionLayout
      description={t(
        "controlOptionalLocationCollectionAndReviewWhatIsStoredForYourAccount"
      )}
      icon={LockKeyhole}
      section="permissions"
      title={t("permissions")}
    >
      {children}
    </AuthAccountSectionLayout>
  )
}
