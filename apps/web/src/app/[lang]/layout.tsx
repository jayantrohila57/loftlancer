import "@packages/ui/globals.css"

import { rootFontClassName } from "@features/font"
import { I18nProvider } from "@features/i18n/provider"
import { ThemeProvider, themeProviderProps } from "@features/theme"
import { VercelWebTelemetry } from "@packages/analytics"
import { DirectionProvider } from "@packages/ui"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { WebPostHog } from "@/shared/analytics/web.posthog.client"
import { serverEnv } from "@/shared/config/web.server-env"
import {
  generateLangStaticParams,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

export async function generateMetadata({
  params,
}: Pick<LangLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await initRequestI18n(params)
  const t = await getTranslations({ locale, namespace: "metadata" })
  return {
    metadataBase: new URL(serverEnv.APP_PUBLIC_URL),
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
        <div className="relative isolate flex min-h-svh flex-col">
          <I18nProvider locale={locale} messages={messages}>
            <DirectionProvider direction={direction}>
              <ThemeProvider {...themeProviderProps}>
                <WebPostHog />
                {children}
              </ThemeProvider>
            </DirectionProvider>
          </I18nProvider>
        </div>
        <VercelWebTelemetry />
      </body>
    </html>
  )
}
