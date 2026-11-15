import { ShellLayout, ShellSubHeader } from "@features/shell"
import {
  OrgCreateSheetAction,
  OrgCreateSheetProvider,
} from "@modules/org/account-screens"
import {
  AccountUserMenuLoader,
  OrganizationsSidebarNav,
  OrganizationsSubnav,
} from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { Building2 } from "lucide-react"
import { Suspense } from "react"
import { AuthAccountSessionGate } from "@/shared/auth/auth-account-session-gate"
import { AuthAccountFormatProvider } from "@/shared/i18n/auth.account-format-provider.client"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import { AuthAccountSessionFallback } from "@/shared/shell/auth-account-session-fallback"
import { HeaderLanguageSelector } from "@/shared/shell/auth-header-language-selector"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

export default async function OrganizationsLayout({
  children,
  params,
}: LangLayoutProps) {
  const t = await getServerTranslations(params, "ui")
  return (
    <AuthAccountFormatProvider>
      <ShellLayout
        languageSelector={<HeaderLanguageSelector />}
        navigation={<OrganizationsSidebarNav />}
        userMenu={<AccountUserMenuLoader />}
      >
        <Suspense fallback={<AuthAccountSessionFallback />}>
          <AuthAccountSessionGate params={params}>
            <OrgCreateSheetProvider>
              <Shell.Panel>
                <ShellSubHeader
                  action={<OrgCreateSheetAction />}
                  description={t("organizationsDashboardDescription")}
                  icon={Building2}
                  title={t("organizations")}
                >
                  <OrganizationsSubnav />
                </ShellSubHeader>
                <Shell.Scroll>{children}</Shell.Scroll>
              </Shell.Panel>
            </OrgCreateSheetProvider>
          </AuthAccountSessionGate>
        </Suspense>
      </ShellLayout>
    </AuthAccountFormatProvider>
  )
}
