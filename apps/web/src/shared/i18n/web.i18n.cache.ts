"use cache"

import { cacheLife, cacheTag } from "next/cache"

export async function getWebCachedMessages(locale: string) {
  cacheTag(`web:i18n-messages:${locale}`)
  cacheLife("max")

  switch (locale) {
    case "en-us":
      return (await import("./messages/web.en-us.json")).default
    case "en-in":
      return (await import("./messages/web.en-in.json")).default
    case "es-es":
      return (await import("./messages/web.es-es.json")).default
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}
