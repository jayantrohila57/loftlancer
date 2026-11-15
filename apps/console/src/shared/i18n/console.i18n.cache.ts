"use cache"

import { cacheLife, cacheTag } from "next/cache"

export async function getConsoleCachedMessages(locale: string) {
  cacheTag(`console:i18n-messages:${locale}`)
  cacheLife("max")

  switch (locale) {
    case "en-us":
      return (await import("./messages/console.en-us.json")).default
    case "en-in":
      return (await import("./messages/console.en-in.json")).default
    case "es-es":
      return (await import("./messages/console.es-es.json")).default
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}
