import "@packages/ui/globals.css"

import { rootFontClassName } from "@features/font"
import { I18nProvider } from "@features/i18n/provider"
import { ThemeProvider, themeProviderProps } from "@features/theme"
import { AppearancePreferencesEffects } from "@modules/appearance-preferences/effects"
import { VercelWebTelemetry } from "@packages/analytics"
import { brand, brandSeo } from "@packages/brand"
import { DirectionProvider } from "@packages/ui"
import { ToastProvider } from "@packages/ui/components/toast"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ConsoleSentry } from "@/shared/analytics/console.sentry.client"
import { ConsoleQueryProvider } from "@/shared/auth/console.query-provider"
import { serverEnv } from "@/shared/config/console.server-env"
import {
  generateLangStaticParams,
  initRequestI18n,
} from "@/shared/i18n/console.i18n.server"
import { ConsoleShellNavigationProvider } from "@/shared/shell/console-shell-navigation"
import type { LangLayoutProps } from "@/shared/types/console.app.types"

export async function generateMetadata({
  params,
}: Pick<LangLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await initRequestI18n(params)
  const t = await getTranslations({ locale, namespace: "metadata" })
  return {
    metadataBase: new URL(serverEnv.APP_PUBLIC_URL),
    applicationName: brand.name,
    title: {
      default: t("title"),
      template: brandSeo.titleTemplate,
    },
    description: t("description"),
    openGraph: {
      type: brandSeo.openGraphType,
      siteName: brand.name,
    },
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
        <div className="relative isolate flex min-h-svh flex-col">
          <I18nProvider locale={locale} messages={messages}>
            <DirectionProvider direction={direction}>
              <ThemeProvider {...themeProviderProps}>
                <ToastProvider position="bottom-center">
                  <ConsoleQueryProvider>
                    <ConsoleSentry />
                    <AppearancePreferencesEffects />
                    <ConsoleShellNavigationProvider>
                      {children}
                    </ConsoleShellNavigationProvider>
                  </ConsoleQueryProvider>
                </ToastProvider>
              </ThemeProvider>
            </DirectionProvider>
          </I18nProvider>
        </div>
        <VercelWebTelemetry />
      </body>
    </html>
  )
}
