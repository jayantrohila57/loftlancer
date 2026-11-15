import { createAppI18nRoutingConfig } from "../config/i18n.config"
import type { DefineAppI18nInput, DefinedAppI18n } from "../types/i18n.types"
import {
  assertMessageImportsCoverLocales,
  createMessagesLoader,
} from "../utils/i18n.messages"
import { createAppI18n } from "./i18n.wiring"

export function defineAppI18n(input: DefineAppI18nInput): DefinedAppI18n {
  const config = createAppI18nRoutingConfig(input.config)
  assertMessageImportsCoverLocales(config.locales, input.messageImports)

  const loadMessages = createMessagesLoader(input.messageImports)

  const bundle = createAppI18n({
    config,
    loadMessages,
  })

  return {
    ...bundle,
    config,
    loadMessages,
    Link: bundle.navigation.Link,
    redirect: bundle.navigation.redirect,
    usePathname: bundle.navigation.usePathname,
    useRouter: bundle.navigation.useRouter,
    getPathname: bundle.navigation.getPathname,
    requestDefault: bundle.requestConfig,
    proxyDefault: bundle.proxy,
  }
}

export type { AppI18nRoutingOverrides } from "../config/i18n.config"
export { createAppI18nRoutingConfig } from "../config/i18n.config"
export type {
  DefineAppI18nInput,
  DefinedAppI18n,
  MessageImportMap,
} from "../types/i18n.types"
