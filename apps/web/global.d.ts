import type {
  I18nLocale,
  I18nMessages,
  i18nFormats,
} from "@/shared/i18n/web.i18n"

declare module "next-intl" {
  interface AppConfig {
    Locale: I18nLocale
    Messages: I18nMessages
    Formats: typeof i18nFormats
  }
}
