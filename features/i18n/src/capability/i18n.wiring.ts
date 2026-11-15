import { loadI18nRoutingConfig } from "../config/i18n.config"
import type { AppI18nInput, AppI18nResult } from "../types/i18n.types"
import {
  createI18nMiddleware,
  createMiddlewareMatcher,
} from "./i18n.middleware"
import { createI18nNavigation } from "./i18n.navigation"
import { createGetRequestConfig } from "./i18n.request"
import { createAppRouting } from "./i18n.routing"

export function createAppI18n(input: AppI18nInput): AppI18nResult {
  const { config, loadMessages } = input
  const routingConfig = loadI18nRoutingConfig(config)
  const routing = createAppRouting(routingConfig)
  const localeSegment = routingConfig.localeSegment
  const requestConfig = createGetRequestConfig({
    routing,
    loadMessages,
  })
  const navigation = createI18nNavigation(routing)
  const proxy = createI18nMiddleware(routing)
  const matcher = createMiddlewareMatcher(routing.locales)

  return {
    routing,
    localeSegment,
    requestConfig,
    navigation,
    proxy,
    proxyConfig: { matcher },
  }
}

export type { AppI18nInput, AppI18nResult }
