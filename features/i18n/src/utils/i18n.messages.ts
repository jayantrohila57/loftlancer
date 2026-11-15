import type { MessageImportMap, MessagesLoader } from "../types/i18n.types"

export function createMessagesLoader(
  imports: MessageImportMap
): MessagesLoader {
  return async (locale: string) => {
    const loader = imports[locale]
    if (!loader) {
      throw new Error(`Unsupported locale: ${locale}`)
    }
    return (await loader()).default
  }
}

export function assertMessageImportsCoverLocales(
  locales: readonly string[],
  messageImports: MessageImportMap
) {
  for (const locale of locales) {
    if (!messageImports[locale]) {
      throw new Error(`Missing message import for locale "${locale}"`)
    }
  }
}
