import { cacheLife, cacheTag } from "next/cache"
import enIn from "./messages/auth.en-in.json"
import enUs from "./messages/auth.en-us.json"
import esEs from "./messages/auth.es-es.json"

async function cacheMessages(
  locale: string,
  messages: Record<string, unknown>
) {
  "use cache"

  cacheTag(`auth:i18n-messages:${locale}`)
  cacheLife("max")
  return messages
}

export async function getAuthCachedMessages(locale: string) {
  switch (locale) {
    case "en-us":
      return cacheMessages(locale, enUs)
    case "en-in":
      return cacheMessages(locale, enIn)
    case "es-es":
      return cacheMessages(locale, esEs)
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}
