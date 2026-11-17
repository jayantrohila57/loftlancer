import "@packages/ui/globals.css"

import { rootFontClassName } from "@features/font"
import { I18nProvider } from "@features/i18n/provider"
import { ThemeProvider, themeProviderProps } from "@features/theme"
import { AppearancePreferencesEffects } from "@modules/appearance-preferences/effects"
import { PrivacyCookieConsentBanner } from "@modules/privacy/client/components/privacy.cookie-consent-banner.client"
import { brand, brandSeo } from "@packages/brand"
import { DirectionProvider } from "@packages/ui"
import { ToastProvider } from "@packages/ui/components/toast"
import type { Metadata, Viewport } from "next"
import { getTranslations } from "next-intl/server"
import { StudioProductAnalytics } from "@/shared/analytics/studio.product-analytics.client"
import { StudioSentry } from "@/shared/analytics/studio.sentry.client"
import { StudioQueryProvider } from "@/shared/auth/studio.query-provider"
import studioPwaManifest from "@/shared/config/studio.pwa.manifest.json"
import { studioAssetPath } from "@/shared/config/studio.pwa.paths"
import { serverEnv } from "@/shared/config/studio.server-env"
import {
  generateLangStaticParams,
  initRequestI18n,
} from "@/shared/i18n/studio.i18n.server"
import { StudioOrgAppPathsProvider } from "@/shared/org/studio-org-app-paths"
import { StudioShellNavigationProvider } from "@/shared/shell/studio-shell-navigation"
import type { LangLayoutProps } from "@/shared/types/studio.app.types"

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
    manifest: studioAssetPath("/favicon/site.webmanifest"),
    icons: {
      icon: [
        {
          url: studioAssetPath("/favicon/favicon-96x96.png"),
          type: "image/png",
          sizes: "96x96",
        },
      ],
      apple: {
        url: studioAssetPath("/favicon/apple-touch-icon.png"),
        sizes: "180x180",
      },
    },
  }
}

export const generateStaticParams = generateLangStaticParams

export const viewport: Viewport = {
  themeColor: studioPwaManifest.theme_color,
}

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
                  <StudioQueryProvider>
                    <StudioProductAnalytics />
                    <StudioSentry />
                    <PrivacyCookieConsentBanner />
                    <AppearancePreferencesEffects />
                    <StudioOrgAppPathsProvider>
                      <StudioShellNavigationProvider>
                        {children}
                      </StudioShellNavigationProvider>
                    </StudioOrgAppPathsProvider>
                  </StudioQueryProvider>
                </ToastProvider>
              </ThemeProvider>
            </DirectionProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  )
}
