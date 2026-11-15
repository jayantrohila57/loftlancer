import { ShellLayout } from "@features/shell"
import { ActivityDestinationHighlight } from "@modules/activity/client"
import { AccountSidebarNav, AccountUserMenuLoader } from "@modules/shell"
import { Suspense } from "react"
import { AuthAccountSessionGate } from "@/shared/auth/auth-account-session-gate"
import { AuthAccountFormatProvider } from "@/shared/i18n/auth.account-format-provider.client"
import { AuthAccountSessionFallback } from "@/shared/shell/auth-account-session-fallback"
import { HeaderLanguageSelector } from "@/shared/shell/auth-header-language-selector"
import { AuthShellCommandMenu } from "@/shared/shell/auth-shell-command-menu"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

export default function AuthAccountLayout({
  children,
  params,
}: LangLayoutProps) {
  return (
    <AuthAccountFormatProvider>
      <AuthShellCommandMenu>
        <ShellLayout
          userMenu={<AccountUserMenuLoader />}
          languageSelector={<HeaderLanguageSelector />}
          navigation={<AccountSidebarNav />}
        >
          <Suspense fallback={<AuthAccountSessionFallback />}>
            <AuthAccountSessionGate params={params}>
              {children}
              <ActivityDestinationHighlight />
            </AuthAccountSessionGate>
          </Suspense>
        </ShellLayout>
      </AuthShellCommandMenu>
    </AuthAccountFormatProvider>
  )
}
