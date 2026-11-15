import createNextIntlPlugin from "next-intl/plugin"

export function appI18nRequestPath(appSlug: string) {
  return `./src/shared/i18n/${appSlug}.i18n.ts`
}

export function createI18nNextPlugin(requestModulePath?: string) {
  if (!requestModulePath) {
    throw new Error(
      "Pass appI18nRequestPath(appSlug) or createI18nNextPluginForApp(appSlug)"
    )
  }
  return createNextIntlPlugin(requestModulePath)
}

export function createI18nNextPluginForApp(appSlug: string) {
  return createNextIntlPlugin(appI18nRequestPath(appSlug))
}
