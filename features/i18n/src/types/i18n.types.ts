import type { createI18nMiddleware } from "../capability/i18n.middleware"
import type { createI18nNavigation } from "../capability/i18n.navigation"
import type { createGetRequestConfig } from "../capability/i18n.request"
import type { createAppRouting } from "../capability/i18n.routing"
import type {
  AppI18nRoutingOverrides,
  I18nRoutingConfig,
} from "../config/i18n.config"

export type { TextDirection } from "../constants/i18n.constants"

export type MessagesLoader = (
  locale: string
) => Promise<Record<string, unknown>>

export type MessageImportMap = Record<
  string,
  () => Promise<{ default: Record<string, unknown> }>
>

export type AppRouting = ReturnType<typeof createAppRouting>

export type I18nRequestConfigInput = {
  routing: AppRouting
  loadMessages: MessagesLoader
}

export type AppI18nInput = {
  config: I18nRoutingConfig
  loadMessages: MessagesLoader
}

export type AppI18nResult = {
  routing: AppRouting
  localeSegment: "locale" | "lang"
  requestConfig: ReturnType<typeof createGetRequestConfig>
  navigation: ReturnType<typeof createI18nNavigation>
  proxy: ReturnType<typeof createI18nMiddleware>
  proxyConfig: { readonly matcher: readonly string[] }
}

export type { AppI18nRoutingOverrides, I18nRoutingConfig }

export type DefineAppI18nInput = {
  config?: AppI18nRoutingOverrides
  messageImports: MessageImportMap
}

export type DefinedAppI18n = AppI18nResult & {
  config: I18nRoutingConfig
  loadMessages: MessagesLoader
  Link: AppI18nResult["navigation"]["Link"]
  redirect: AppI18nResult["navigation"]["redirect"]
  usePathname: AppI18nResult["navigation"]["usePathname"]
  useRouter: AppI18nResult["navigation"]["useRouter"]
  getPathname: AppI18nResult["navigation"]["getPathname"]
  requestDefault: AppI18nResult["requestConfig"]
  proxyDefault: AppI18nResult["proxy"]
}

export interface LocaleSwitcherControlProps {
  className?: string
  labels?: Readonly<Record<string, string>>
  regionCodes?: Readonly<Record<string, string>>
  placeholder?: string
  changeLanguageLabel?: string
}
