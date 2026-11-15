import "@packages/ui/globals.css"

import { rootFontClassName } from "@features/font"
import { I18nProvider } from "@features/i18n/provider"
import { ThemeProvider, themeProviderProps } from "@features/theme"
import { AuthAppearancePreferencesEffects } from "@modules/appearance-preferences"
import { VercelWebTelemetry } from "@packages/analytics"
import { DirectionProvider } from "@packages/ui"
import Shell from "@packages/ui/components/shell"
import { ToastProvider } from "@packages/ui/components/toast"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthSentry } from "@/shared/analytics/auth.sentry.client"
import { AuthQueryProvider } from "@/shared/auth/auth.query-provider"
import { AuthAutumnProvider } from "@/shared/auth/auth-autumn-provider.client"
import { serverEnv } from "@/shared/config/auth.server-env"
import {
  generateLangStaticParams,
  initRequestI18n,
} from "@/shared/i18n/auth.i18n.server"
import { AuthShellNavigationProvider } from "@/shared/shell/auth-shell-navigation"
import type { LangLayoutProps } from "@/shared/types/auth.app.types"

export async function generateMetadata({
  params,
}: Pick<LangLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await initRequestI18n(params)
  const t = await getTranslations({ locale, namespace: "metadata" })
  return {
    metadataBase: new URL(serverEnv.BETTER_AUTH_URL),
    title: t("title"),
    description: t("description"),
  }
}

export const generateStaticParams = generateLangStaticParams

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { direction, locale, messages } = await initRequestI18n(params)

  return (
    <html
      className={rootFontClassName()}
      dir={direction}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="relative">
        <Shell.Host>
          <I18nProvider locale={locale} messages={messages}>
            <DirectionProvider direction={direction}>
              <ThemeProvider {...themeProviderProps}>
                <ToastProvider position="bottom-center">
                  <AuthQueryProvider>
                    <AuthSentry />
                    <AuthAutumnProvider>
                      <AuthAppearancePreferencesEffects />
                      <AuthShellNavigationProvider>
                        {children}
                      </AuthShellNavigationProvider>
                    </AuthAutumnProvider>
                  </AuthQueryProvider>
                </ToastProvider>
              </ThemeProvider>
            </DirectionProvider>
          </I18nProvider>
        </Shell.Host>
        <VercelWebTelemetry />
      </body>
    </html>
  )
}
